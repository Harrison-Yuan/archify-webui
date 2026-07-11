import i18n from './i18n'

// ====== 统一 API 配置 ======
const API_CONFIG = {
  baseURL: '/api',
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
}

// ====== 统一错误类型 ======
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ====== 统一请求方法 ======
async function request<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_CONFIG.timeout)

  try {
    const res = await fetch(`${API_CONFIG.baseURL}${path}`, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    const data = await res.json().catch(() => null)

    if (!res.ok) {
      const message = data?.error || data?.details || `请求失败 (${res.status})`
      throw new ApiError(message, data?.code, res.status)
    }

    return data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('请求超时，请重试', 'TIMEOUT')
    }
    throw new ApiError('网络连接失败，请检查后端服务是否启动', 'NETWORK')
  } finally {
    clearTimeout(timer)
  }
}

// ====== API 接口 ======

export interface GenerateResult {
  schema_version: number
  diagram_type: string
  meta: { title: string; subtitle?: string }
  components: unknown[]
  connections?: unknown[]
  [key: string]: unknown
}

export interface RenderResult {
  html: string
}

function getLang(): string {
  return i18n.language.startsWith('zh') ? 'zh' : 'en'
}

/** 自然语言 → 架构图 JSON */
export function generateJson(prompt: string, diagramType: string): Promise<GenerateResult> {
  return request<GenerateResult>('/generate', { prompt, diagramType, language: getLang() })
}

/** 架构图 JSON → HTML */
export function renderDiagram(json: object, diagramType: string): Promise<RenderResult> {
  return request<RenderResult>('/render', { json, diagramType, language: getLang() })
}
