import OpenAI from "openai";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { config, DiagramType } from "./config.js";

export class LLMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMError";
  }
}

const MAX_RETRY = 2;

// ====== LLM 客户端 ======
function getClient(): OpenAI {
  if (!config.llm.apiKey || config.llm.apiKey.includes("placeholder")) {
    throw new LLMError("LLM 未配置。请在 .env 文件中设置 LLM_API_KEY。");
  }

  return new OpenAI({
    apiKey: config.llm.apiKey,
    baseURL: config.llm.baseURL || undefined,
    timeout: config.llm.timeout,
    maxRetries: config.llm.maxRetries,
  });
}

// ====== 错误信息转译 ======
const ERROR_TRANSLATIONS: Record<string, string> = {
  "validation failed": "格式校验未通过",
  "must set schema_version": "缺少 schema_version 字段",
  "must set diagram_type": "缺少 diagram_type 字段",
  "must include meta.title": "缺少 meta.title 标题",
  "must be unique": "存在重复ID",
  "is less than 8px apart": "组件间距过近",
  "falls outside the viewBox": "组件超出视图边界",
  "is wider than component": "标签文字超出组件宽度",
  "references unknown": "引用了不存在的组件",
  "is too short": "连接距离过短",
  "overlaps component": "标签与组件重叠",
  "Component ids must be unique": "组件 ID 必须唯一",
};

function translateErrors(raw: string): string {
  let result = raw;
  for (const [en, zh] of Object.entries(ERROR_TRANSLATIONS)) {
    result = result.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), zh);
  }
  return result;
}

// ====== 模板静态文字替换（zh 模式） ======
const HTML_LOCALE_MAP: [RegExp, string][] = [
  [/Legend/g, "图例"],
  [/Export/g, "导出"],
  [/Dark/g, "深色"],
  [/Light/g, "浅色"],
  [/Copy to clipboard/g, "复制到剪贴板"],
  [/Download PNG/g, "下载 PNG"],
  [/Download JPEG/g, "下载 JPEG"],
  [/Download WebP/g, "下载 WebP"],
  [/Download SVG/g, "下载 SVG"],
  [/vector/g, "矢量图"],
  [/Diagram/g, "图表"],
  [/diagram/g, "图表"],
  [/Theme/g, "主题"],
  [/Toggle theme/g, "切换主题"],
  [/Press <kbd>T<\/kbd> for theme/g, "按 <kbd>T<\/kbd> 切换主题"],
  [/Press <kbd>E<\/kbd> for export/g, "按 <kbd>E<\/kbd> 导出"],
  [/built with Archify/g, "由 Archify 生成"],
];

export function localizeHtml(html: string): string {
  let result = html;
  for (const [pattern, replacement] of HTML_LOCALE_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// ====== Renderer 校验 ======
function validateViaRenderer(diagramType: string, json: object): string[] {
  const tmpDir = mkdtempSync(join(tmpdir(), "archify-validate-"));
  try {
    const inputPath = join(tmpDir, "input.json");
    writeFileSync(inputPath, JSON.stringify(json), "utf-8");

    const rendererPath = join(config.renderer.root, diagramType, `render-${diagramType}.mjs`);
    const outPath = join(tmpDir, "output.html");

    execSync(`node "${rendererPath}" "${inputPath}" "${outPath}"`, {
      stdio: "pipe",
      timeout: 15000,
    });

    return [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const lines = msg
      .split("\n")
      .filter((l) => /validation failed|^- /.test(l) || /Error:/.test(l))
      .map((l) => l.replace(/^Error:\s*/, ""))
      .map((l) => translateErrors(l));

    return lines.length > 0 ? lines : ["架构图格式校验未通过，请重新描述"];
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ====== 调用 LLM ======
async function callLLM(
  client: OpenAI,
  systemPrompt: string,
  userMessage: string,
  temperature: number
): Promise<string> {
  const response = await client.chat.completions.create({
    model: config.llm.model,
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });
  return response.choices[0]?.message?.content || "";
}

// ====== 根据语言获取提示词 ======
function buildPrompts(diagramType: DiagramType, schema: string, example: string, language: string) {
  const label = config.typeLabels[diagramType] || diagramType;

  // ====== 通用布局规范 ======
  const qualityRules = `生成高质量图表的布局规范：

【组件布局】
- 所有组件必须在 viewBox 范围内均匀分布，间距不小于 40px
- 组件尺寸建议：标准 130x60，小型标签 120x60，大型服务 150x64
- 使用边界（boundaries）将相关组件分组，边界要有明确的语义标签
- 每张图至少包含 6 个组件，最多 12 个，除非用户明确要求更多/更少

【组件类型】
- 用户/外部系统用 "external"（放在最左侧或最顶部）
- Web/移动端 UI 用 "frontend"
- API/微服务用 "backend"
- 数据库/缓存用 "database"
- 云基础设施（LB/CDN/DNS）用 "cloud"
- 认证/安全用 "security"
- 消息队列/事件总线用 "messagebus"

【连接规范】
- 数据流从左到右，从上到下
- 主要路径用 "emphasis" 变体
- 安全相关连接（认证、加密）用 "security" 变体
- 异步/后台连接用 "dashed" 变体
- 每条连接都要有清晰的 label 描述

【信息卡（cards）】
- 至少 2 张信息卡，最多 4 张
- 每张卡点 3-5 个要点
- 点的颜色与内容主题匹配（前端→cyan，后端→emerald，安全→rose，数据→violet）
- 卡片用 dot 颜色标识分类

【架构最佳实践】
- **微服务系统**：API 网关 → 服务发现 → 业务服务 → 数据存储，消息队列解耦服务间通信
- **分层架构**：展示层（frontend）→ 应用层（backend）→ 数据层（database），各层职责分明
- **云原生架构**：CDN → 负载均衡 → 应用集群 → 分布式缓存 → 读写分离数据库
- **安全架构**：认证在前端入口处（security），加密连接（security variant），内外网隔离（region）
- **事件驱动架构**：生产者 → 消息总线/事件总线 → 消费者，事件流用 dashed 连接
- **数据流架构**：采集 → 清洗 → 存储 → 分析 → 展示，stage 体现数据流向
- 选择最匹配用户场景的架构风格，不必拘泥于固定模式`;

  if (language === "en") {
    return {
      systemPrompt: `You are an Archify diagram JSON generator. Generate a professional-grade "${label}" diagram JSON.

JSON structure:
${schema}

Complete example:
${example}

${qualityRules.replace(/【([^】]+)】/g, '[$1]').replace(/[：:]/g, ': ')}
`,
      userMessage: `Generate a professional "${label}" diagram JSON for: `,
      retryMessage: (errors: string[]) => `The generated JSON failed validation. Fix based on these errors:

${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

Fix only the reported issues. Maintain professional layout standards.`,
    };
  }

  // 默认中文
  return {
    systemPrompt: `你是一个 Archify 图表 JSON 生成器。请根据用户需求，生成一张专业水准的"${label}"。

该图表类型的 JSON 结构：
${schema}

完整的示例 JSON：
${example}

${qualityRules}

【元数据】
- meta.title 保持简短专业（如"电商平台架构"）
- meta.subtitle 补充说明（如"核心服务与数据流"）

重要规则：
- diagram_type 必须是 "${diagramType}"
- schema_version 必须是 1
- 所有 ID 用 kebab-case 且唯一（如 "user-service"）
- 所有 label/sublabel/title/tag/items 内容必须使用中文
- 组件位置（pos）和尺寸（size）要合理，不重叠
- 图表要清晰展示系统全貌，体现专业架构设计水准`,
    userMessage: `请为以下场景生成一张专业的"${label}" JSON：`,
    retryMessage: (errors: string[]) => `上次生成的 JSON 校验未通过，请根据以下错误修正：

${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}

注意事项：
- 只修改指出的问题，不要重写整个 JSON
- 如果涉及位置/尺寸问题，调整后确保整体布局合理
- 保持组件类型分配的合理性
- **所有文本内容必须使用中文**`,
  };
}

// ====== 主入口 ======
export async function generateJson(
  prompt: string,
  diagramType: DiagramType,
  schema: string,
  example: string,
  language: string = "zh"
): Promise<object> {
  const client = getClient();
  const { systemPrompt, userMessage, retryMessage } = buildPrompts(diagramType, schema, example, language);

  const userMsg = `${userMessage} ${prompt}`;

  // 初次生成
  let content = await callLLM(client, systemPrompt, userMsg, 0.3);
  let json: object;

  try {
    json = JSON.parse(content);
  } catch {
    content = await callLLM(client, systemPrompt, userMsg, 0.2);
    json = JSON.parse(content);
  }

  // 多轮校验修正
  for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
    const errors = validateViaRenderer(diagramType, json);

    if (errors.length === 0) {
      return json;
    }

    const retryMsg = `${userMsg}\n\n${retryMessage(errors)}`;
    content = await callLLM(client, systemPrompt, retryMsg, 0.2);
    json = JSON.parse(content);
  }

  // 最后一次校验
  const finalErrors = validateViaRenderer(diagramType, json);
  if (finalErrors.length > 0) {
    throw new LLMError(
      language === "en"
        ? `Validation failed after multiple attempts:\n${finalErrors.map((e) => `- ${e}`).join("\n")}`
        : `多次修正后仍未通过校验，请尝试更详细的描述：\n${finalErrors.map((e) => `- ${e}`).join("\n")}`
    );
  }

  return json;
}
