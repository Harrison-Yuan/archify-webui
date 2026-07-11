import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// 加载根目录 .env（单配置源）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "../../../.env") });

export const VALID_DIAGRAM_TYPES = [
  "architecture",
  "workflow",
  "sequence",
  "dataflow",
  "lifecycle",
] as const;

export type DiagramType = (typeof VALID_DIAGRAM_TYPES)[number];

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),

  llm: {
    apiKey: process.env.LLM_API_KEY || "",
    baseURL: process.env.LLM_BASE_URL || "",
    model: process.env.LLM_MODEL || "deepseek-chat",
    timeout: parseInt(process.env.LLM_TIMEOUT || "60000", 10),
    maxRetries: parseInt(process.env.LLM_MAX_RETRIES || "2", 10),
  },

  renderer: {
    // 根据项目目录结构自动推导 renderer 路径
    root: resolve(__dirname, "../../..", "archify", "renderers"),
  },

  diagramTypes: VALID_DIAGRAM_TYPES,

  typeLabels: {
    architecture: "架构图",
    workflow: "工作流/流程图",
    sequence: "时序图",
    dataflow: "数据流图",
    lifecycle: "生命周期图",
  } as Record<string, string>,
};
