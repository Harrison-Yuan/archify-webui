import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import InputPanel from '../components/InputPanel'
import DiagramPreview from '../components/DiagramPreview'
import { generateJson, renderDiagram, ApiError } from '../api'

const EXAMPLES_ZH: Record<string, string[]> = {
  architecture: [
    '一个电商平台，前端 React，后端 Node.js，PostgreSQL 数据库，Redis 缓存，部署在阿里云',
    '微服务架构：网关层（Nginx）、服务层（用户/订单/商品服务）、数据层（MySQL 集群）、消息队列（Kafka）',
    'SaaS 平台架构：多租户隔离、API 网关、认证中心、计费服务、对象存储',
    '大数据平台：数据采集（Flume）→ 消息队列（Kafka）→ 计算（Spark/Flink）→ 存储（HDFS/ClickHouse）',
    'IoT 系统架构：设备层（传感器）→ 边缘网关 → MQTT Broker → 流处理 → 时序数据库 → 可视化',
  ],
  workflow: [
    '用户注册流程：填写信息 → 验证邮箱 → 审核 → 激活账号',
    '订单处理流程：下单 → 支付 → 支付回调 → 发货 → 确认收货 → 完成',
    '发布流程：开发 → 代码审查 → 测试 → 预发布 → 生产部署 → 监控',
    '退款流程：提交申请 → 审核 → 退款处理 → 通知用户 → 完成',
    '内容审核流程：用户上传 → 自动审核 → 人工复审 → 发布/驳回',
  ],
  sequence: [
    '用户登录流程：前端发送请求 → 后端验证密码 → 返回 Token',
    'API 调用流程：客户端 → 负载均衡 → API 网关 → 微服务 → 数据库 → 响应',
    'SSO 单点登录：用户访问应用 → 重定向认证中心 → 验证凭证 → 签发 Token → 回传应用',
    '支付流程：前端 → 商户服务 → 支付网关 → 银行 → 异步通知 → 回调前端',
    '消息推送流程：应用服务 → 推送服务 → APNs/FCM → 设备 → 回执',
  ],
  dataflow: [
    '用户行为数据采集：客户端埋点 → 消息队列 → 清洗 → 数仓 → 报表',
    '日志处理流程：服务日志 → Filebeat → Logstash → Elasticsearch → Kibana 展示',
    '实时推荐系统：用户行为 → Kafka → Flink 实时计算 → Redis 特征存储 → 推荐服务 → 展示',
    'ETL 数据管道：源数据库 → CDC（Debezium）→ Kafka → Flink ETL → 目标数仓（ClickHouse）',
    '实时监控系统：指标采集（Prometheus）→ 告警规则评估 → AlertManager → 通知渠道（邮件/钉钉）',
  ],
  lifecycle: [
    '订单生命周期：创建 → 支付 → 发货 → 完成',
    '用户账号生命周期：注册 → 活跃 → 休眠 → 注销',
    '工单生命周期：提交 → 分配 → 处理 → 验收 → 关闭',
    '容器生命周期：创建 → 运行中 → 停止 → 删除',
    '部署流水线：构建 → 测试 → 打包 → 部署 → 验证 → 回滚',
  ],
}

const EXAMPLES_EN: Record<string, string[]> = {
  architecture: [
    'E-commerce platform: React frontend, Node.js backend, PostgreSQL, Redis cache, deployed on AWS',
    'Microservices: Nginx gateway, user/order/product services, MySQL cluster, Kafka message queue',
    'SaaS platform: multi-tenant, API gateway, auth service, billing, object storage',
    'Big data platform: Flume → Kafka → Spark/Flink → HDFS/ClickHouse',
    'IoT system: sensors → edge gateway → MQTT → stream processing → time-series DB → dashboard',
  ],
  workflow: [
    'User registration: fill form → verify email → review → activate account',
    'Order processing: place order → pay → payment callback → ship → confirm → complete',
    'CI/CD pipeline: develop → code review → test → staging → production → monitor',
    'Refund process: submit request → review → process refund → notify user → done',
    'Content moderation: user upload → auto review → manual review → publish/reject',
  ],
  sequence: [
    'User login: frontend sends request → backend verifies password → returns JWT token',
    'API call flow: client → load balancer → API gateway → microservice → DB → response',
    'SSO login: user → app → redirect to IdP → verify credentials → issue token → callback',
    'Payment flow: frontend → merchant service → payment gateway → bank → async notification',
    'Push notification: app server → push service → APNs/FCM → device → receipt',
  ],
  dataflow: [
    'User behavior tracking: client SDK → message queue → ETL → data warehouse → dashboard',
    'Log pipeline: service logs → Filebeat → Logstash → Elasticsearch → Kibana',
    'Real-time recommendation: user actions → Kafka → Flink → Redis features → recommend service → UI',
    'ETL pipeline: source DB → Debezium CDC → Kafka → Flink ETL → ClickHouse',
    'Monitoring: Prometheus → alert rules → AlertManager → notification channels (email/Slack)',
  ],
  lifecycle: [
    'Order lifecycle: created → paid → shipped → completed',
    'User account: registered → active → dormant → deactivated',
    'Ticket lifecycle: submitted → assigned → processing → review → closed',
    'Container lifecycle: created → running → stopped → deleted',
    'Deployment pipeline: build → test → package → deploy → verify → rollback',
  ],
}

const DIAGRAM_TYPES = ['architecture', 'workflow', 'sequence', 'dataflow', 'lifecycle'] as const
type DiagramType = typeof DIAGRAM_TYPES[number]

export default function HomePage() {
  const { i18n } = useTranslation()
  const [diagramType, setDiagramType] = useState<DiagramType>('architecture')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jsonResult, setJsonResult] = useState<object | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setRenderedHtml(null)
    setJsonResult(null)

    try {
      const json = await generateJson(prompt.trim(), diagramType)
      setJsonResult(json)

      const data = await renderDiagram(json, diagramType)
      setRenderedHtml(data.html)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('生成失败，请重试')
      }
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, diagramType, isGenerating])

  const handleDiagramTypeChange = useCallback((type: string) => {
    setDiagramType(type as DiagramType)
    setError(null)
    setRenderedHtml(null)
    setJsonResult(null)
  }, [])

  const examples = i18n.language.startsWith('zh') ? EXAMPLES_ZH : EXAMPLES_EN
  const currentExamples = examples[diagramType] || examples.architecture

  return (
    <div>
      <InputPanel
        diagramType={diagramType}
        prompt={prompt}
        isGenerating={isGenerating}
        onDiagramTypeChange={handleDiagramTypeChange}
        onPromptChange={setPrompt}
        onGenerate={handleGenerate}
        examples={currentExamples}
      />
      <DiagramPreview
        html={renderedHtml}
        isLoading={isGenerating}
        error={error}
      />
    </div>
  )
}
