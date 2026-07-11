export interface PromptTemplate {
  schema: string;
  example: string;
}

export const promptTemplates: Record<string, PromptTemplate> = {
  architecture: {
    schema: `The JSON must follow this structure:
- schema_version: number (always 1)
- diagram_type: "architecture"
- meta: { title: string, subtitle: string }
- components: array of {
    id: string,
    type: "frontend" | "backend" | "database" | "cloud" | "security" | "messagebus" | "external",
    label: string,
    sublabel: string,
    pos: [number, number],
    size: [number, number],
    tag?: string
  }
- connections: array of {
    from: string,
    to: string,
    label?: string,
    variant?: "default" | "emphasis" | "security" | "dashed",
    fromSide?: "top" | "bottom" | "left" | "right",
    toSide?: "top" | "bottom" | "left" | "right",
    labelDy?: number
  }
- boundaries: array of {
    kind: "region" | "security-group",
    label: string,
    wraps: string[]
  }
- cards: array of {
    dot: "cyan" | "emerald" | "violet" | "amber" | "rose" | "orange" | "slate",
    title: string,
    items: string[]
  }`,
    example: `{
  "schema_version": 1,
  "diagram_type": "architecture",
  "meta": {
    "title": "Sample Web App",
    "subtitle": "Classic 3-tier SaaS on AWS — rendered by Archify",
    "output": "web-app-rendered.html"
  },
  "components": [
    { "id": "users", "type": "external", "label": "Users", "sublabel": "Browser / Mobile", "pos": [40, 300], "size": [120, 60] },
    { "id": "auth", "type": "security", "label": "Auth Provider", "sublabel": "OAuth 2.0", "pos": [40, 110], "size": [120, 64], "tag": "JWT + PKCE" },
    { "id": "cdn", "type": "cloud", "label": "CloudFront", "sublabel": "CDN", "pos": [250, 300], "size": [130, 60] },
    { "id": "lb", "type": "cloud", "label": "Load Balancer", "sublabel": "HTTPS :443", "pos": [460, 300], "size": [130, 60] },
    { "id": "api", "type": "backend", "label": "API Server", "sublabel": "FastAPI :8000", "pos": [670, 300], "size": [130, 60] },
    { "id": "cache", "type": "database", "label": "Redis", "sublabel": "cache :6379", "pos": [670, 150], "size": [130, 60] },
    { "id": "db", "type": "database", "label": "PostgreSQL", "sublabel": "primary :5432", "pos": [880, 300], "size": [130, 60] },
    { "id": "s3", "type": "cloud", "label": "S3", "sublabel": "static assets", "pos": [250, 440], "size": [130, 60], "tag": "OAI protected" },
    { "id": "queue", "type": "messagebus", "label": "SQS", "sublabel": "job queue", "pos": [670, 440], "size": [130, 60] },
    { "id": "worker", "type": "backend", "label": "Worker", "sublabel": "async jobs", "pos": [880, 440], "size": [130, 60] }
  ],
  "boundaries": [
    { "kind": "region", "label": "AWS Region: us-west-2", "wraps": ["cdn", "lb", "api", "cache", "db", "s3", "queue", "worker"] },
    { "kind": "security-group", "label": "sg-api :443/:8000", "wraps": ["lb", "api"] }
  ],
  "connections": [
    { "from": "users", "to": "cdn", "label": "HTTPS", "variant": "emphasis" },
    { "from": "auth", "to": "api", "label": "verify JWT", "variant": "security", "fromSide": "right", "toSide": "top" },
    { "from": "cdn", "to": "lb" },
    { "from": "cdn", "to": "s3", "label": "static", "variant": "dashed", "fromSide": "bottom", "toSide": "top", "labelDy": 58 },
    { "from": "lb", "to": "api" },
    { "from": "api", "to": "cache", "label": "read-through", "fromSide": "top", "toSide": "bottom", "labelDy": -68 },
    { "from": "api", "to": "db", "label": "SQL" },
    { "from": "api", "to": "queue", "label": "enqueue", "variant": "dashed", "fromSide": "bottom", "toSide": "top", "labelDy": 58 },
    { "from": "queue", "to": "worker" }
  ],
  "cards": [
    { "dot": "cyan", "title": "Edge", "items": ["CloudFront CDN fronts all traffic", "S3 serves static assets via OAI"] },
    { "dot": "emerald", "title": "Application", "items": ["FastAPI behind an HTTPS load balancer", "Redis read-through cache", "Async work drained from SQS by a worker"] },
    { "dot": "rose", "title": "Security", "items": ["OAuth 2.0 with JWT + PKCE", "API + LB isolated in a security group"] }
  ]
}`
  },
  workflow: {
    schema: `The JSON must follow this structure:
- schema_version: number (always 1)
- diagram_type: "workflow"
- meta: { title: string, subtitle: string, viewBox?: [number, number] }
- lanes: array of { id: string, label: string, variant?: "exception" }
- phases?: array of { id: string, label: string, fromCol: number, toCol: number, variant?: "emphasis" | "dashed" }
- groups?: array of { id: string, label: string, lane: string, fromCol: number, toCol: number, variant?: "emphasis" | "dashed" | "security" }
- nodes: array of {
    id: string,
    lane: string,
    col: number,
    type: "frontend" | "backend" | "database" | "cloud" | "security" | "messagebus" | "external",
    label: string,
    sublabel: string,
    tag?: string
  }
- edges: array of {
    from: string,
    to: string,
    label?: string,
    variant?: "default" | "emphasis" | "security" | "dashed",
    fromSide?: "top" | "bottom" | "left" | "right",
    toSide?: "top" | "bottom" | "left" | "right",
    route?: "drop" | "return-left" | "outside-right" | "bottom-channel",
    role?: "error" | "branch" | "return",
    labelSegment?: number,
    labelDx?: number,
    labelDy?: number,
    width?: number,
    labelAt?: [number, number]
  }
- cards?: array of {
    dot: "cyan" | "emerald" | "violet" | "amber" | "rose" | "orange" | "slate",
    title: string,
    items: string[]
  }`,
    example: `{
  "schema_version": 1,
  "diagram_type": "workflow",
  "meta": {
    "title": "Agent Tool Call Workflow",
    "subtitle": "Renderer-driven workflow prototype with lanes, anchored nodes, and orthogonal edges",
    "output": "examples/workflow-agent-tool-call-rendered.html",
    "viewBox": [720, 900]
  },
  "lanes": [
    { "id": "ui", "label": "User Interface" },
    { "id": "agent", "label": "Agent Runtime" },
    { "id": "policy", "label": "Policy Boundary" },
    { "id": "exceptions", "label": "Exception Handling", "variant": "exception" },
    { "id": "tools", "label": "Tool Execution" },
    { "id": "trace", "label": "Observability" }
  ],
  "phases": [
    { "id": "intake", "label": "Intake", "fromCol": 0, "toCol": 1 },
    { "id": "reasoning", "label": "Plan + route", "fromCol": 2, "toCol": 3, "variant": "emphasis" },
    { "id": "execution", "label": "Execute + report", "fromCol": 4, "toCol": 5, "variant": "dashed" }
  ],
  "groups": [
    { "id": "agent_loop", "label": "Planning loop", "lane": "agent", "fromCol": 2, "toCol": 3, "variant": "emphasis" },
    { "id": "tool_work", "label": "Tool work", "lane": "tools", "fromCol": 4, "toCol": 5, "variant": "dashed" },
    { "id": "exception_path", "label": "Human or policy stop", "lane": "exceptions", "fromCol": 3, "toCol": 5, "variant": "security" }
  ],
  "mainPath": ["user", "chat", "planner", "router", "approval", "tool", "external", "final"],
  "nodes": [
    { "id": "user", "lane": "ui", "col": 0, "type": "external", "label": "User", "sublabel": "asks for work" },
    { "id": "chat", "lane": "ui", "col": 1, "type": "frontend", "label": "Chat Surface", "sublabel": "thread + files" },
    { "id": "final", "lane": "ui", "col": 5, "type": "backend", "label": "Final Reply", "sublabel": "answer + changes" },
    { "id": "planner", "lane": "agent", "col": 2, "type": "backend", "label": "Agent Planner", "sublabel": "plan next step", "tag": "context aware" },
    { "id": "router", "lane": "agent", "col": 3, "type": "backend", "label": "Tool Router", "sublabel": "choose capability" },
    { "id": "approval", "lane": "policy", "col": 3, "type": "security", "label": "Approval Gate", "sublabel": "scope + consent", "tag": "block risky ops" },
    { "id": "blocked", "lane": "exceptions", "col": 4, "type": "security", "label": "Blocked", "sublabel": "wait or reject" },
    { "id": "retry", "lane": "exceptions", "col": 5, "type": "messagebus", "label": "Retry Path", "sublabel": "revise request" },
    { "id": "tool", "lane": "tools", "col": 4, "type": "messagebus", "label": "Tool Call", "sublabel": "shell / browser / MCP", "tag": "structured result" },
    { "id": "external", "lane": "tools", "col": 5, "type": "cloud", "label": "External API", "sublabel": "network service" },
    { "id": "store", "lane": "trace", "col": 1, "type": "database", "label": "Context Store", "sublabel": "repo + memory" },
    { "id": "trace", "lane": "trace", "col": 4, "type": "database", "label": "Trace Log", "sublabel": "events + output" }
  ],
  "edges": [
    { "from": "user", "to": "chat", "variant": "default" },
    { "from": "chat", "to": "planner", "label": "plan", "variant": "emphasis", "fromSide": "bottom", "toSide": "top", "route": "drop", "labelSegment": 1 },
    { "from": "planner", "to": "router", "variant": "default" },
    { "from": "router", "to": "approval", "label": "needs approval?", "variant": "security", "fromSide": "bottom", "toSide": "top", "route": "drop", "labelSegment": 0, "labelDx": 34, "labelDy": 18 },
    { "from": "approval", "to": "tool", "variant": "emphasis", "fromSide": "left", "toSide": "left", "route": "return-left" },
    { "from": "approval", "to": "blocked", "label": "denied", "variant": "security", "role": "error", "fromSide": "bottom", "toSide": "top", "route": "drop", "labelSegment": 1, "labelDy": 12 },
    { "from": "blocked", "to": "retry", "variant": "dashed", "role": "branch" },
    { "from": "tool", "to": "external", "variant": "default" },
    { "from": "external", "to": "final", "variant": "emphasis", "role": "return", "fromSide": "right", "toSide": "right", "route": "outside-right", "width": 1.2 },
    { "from": "external", "to": "trace", "label": "record result", "variant": "dashed", "fromSide": "bottom", "toSide": "bottom", "route": "bottom-channel", "labelSegment": 1 },
    { "from": "store", "to": "trace", "label": "trace + memory", "variant": "dashed", "labelAt": [365, 735] }
  ],
  "cards": [
    {
      "dot": "cyan",
      "title": "Renderer Rules",
      "items": [
        "Lanes and columns determine node placement",
        "Edges attach to explicit node anchors",
        "Cross-lane paths use orthogonal routing",
        "Short adjacent links stay unlabeled"
      ]
    },
    {
      "dot": "rose",
      "title": "Workflow Semantics",
      "items": [
        "Approval is a first-class policy step",
        "Consent gates are visible in the main path",
        "External calls stay inside the tool lane",
        "Trace writes are separate from the hot path"
      ]
    },
    {
      "dot": "emerald",
      "title": "Why It Matters",
      "items": [
        "This is closer to a diagram_type renderer",
        "The graph can be edited without SVG surgery",
        "Layout rules can be tested and improved",
        "A future IR can reuse this shape directly"
      ]
    }
  ]
}`
  },
  sequence: {
    schema: `The JSON must follow this structure:
- schema_version: number (always 1)
- diagram_type: "sequence"
- meta: { title: string, subtitle: string, viewBox?: [number, number] }
- participants: array of {
    id: string,
    type: "external" | "frontend" | "backend" | "database" | "cloud" | "security" | "messagebus",
    label: string,
    sublabel: string
  }
- segments?: array of { from: number, to: number, label: string }
- messages: array of {
    from: string,
    to: string,
    y: number,
    label: string,
    variant: "default" | "emphasis" | "security" | "return" | "dashed"
  }
- activations: array of {
    participant: string,
    from: number,
    to: number,
    type: string
  }
- cards?: array of {
    dot: "cyan" | "emerald" | "violet" | "amber" | "rose" | "orange" | "slate",
    title: string,
    items: string[]
  }`,
    example: `{
  "schema_version": 1,
  "diagram_type": "sequence",
  "meta": {
    "title": "Cache Miss Request Sequence",
    "subtitle": "Frontend request path with auth, cache fallback, persistence, and async trace",
    "output": "examples/sequence-cache-miss-request.html",
    "viewBox": [820, 760]
  },
  "participants": [
    { "id": "user", "type": "external", "label": "User", "sublabel": "browser session" },
    { "id": "web", "type": "frontend", "label": "Web App", "sublabel": "React UI" },
    { "id": "api", "type": "backend", "label": "API", "sublabel": "request handler" },
    { "id": "auth", "type": "security", "label": "Auth", "sublabel": "JWT verify" },
    { "id": "redis", "type": "database", "label": "Redis", "sublabel": "cache" },
    { "id": "db", "type": "database", "label": "Postgres", "sublabel": "source of truth" },
    { "id": "trace", "type": "messagebus", "label": "Trace", "sublabel": "async event" }
  ],
  "segments": [
    { "from": 150, "to": 295, "label": "Request" },
    { "from": 315, "to": 505, "label": "Fallback" },
    { "from": 525, "to": 665, "label": "Response + trace" }
  ],
  "messages": [
    { "from": "user", "to": "web", "y": 185, "label": "open page", "variant": "default" },
    { "from": "web", "to": "api", "y": 228, "label": "GET /dashboard", "variant": "emphasis" },
    { "from": "api", "to": "auth", "y": 270, "label": "verify JWT", "variant": "security" },
    { "from": "auth", "to": "api", "y": 305, "label": "claims ok", "variant": "return" },
    { "from": "api", "to": "redis", "y": 354, "label": "read cache", "variant": "default" },
    { "from": "redis", "to": "api", "y": 391, "label": "miss", "variant": "return" },
    { "from": "api", "to": "db", "y": 443, "label": "query profile + metrics", "variant": "emphasis" },
    { "from": "db", "to": "api", "y": 489, "label": "rows", "variant": "return" },
    { "from": "api", "to": "redis", "y": 536, "label": "set cache", "variant": "dashed" },
    { "from": "api", "to": "trace", "y": 580, "label": "emit trace", "variant": "dashed" },
    { "from": "api", "to": "web", "y": 625, "label": "200 JSON", "variant": "return" },
    { "from": "web", "to": "user", "y": 662, "label": "render", "variant": "return" }
  ],
  "activations": [
    { "participant": "web", "from": 220, "to": 668, "type": "frontend" },
    { "participant": "api", "from": 228, "to": 632, "type": "backend" },
    { "participant": "auth", "from": 265, "to": 310, "type": "security" },
    { "participant": "redis", "from": 349, "to": 398, "type": "database" },
    { "participant": "db", "from": 438, "to": 496, "type": "database" },
    { "participant": "trace", "from": 575, "to": 630, "type": "messagebus" }
  ],
  "cards": [
    {
      "dot": "emerald",
      "title": "Happy Path",
      "items": [
        "The main request is Web App -> API -> data source -> response",
        "Return messages are quieter than forward calls",
        "Activation bars make ownership duration visible"
      ]
    },
    {
      "dot": "rose",
      "title": "Policy + Fallback",
      "items": [
        "JWT verification is colored as a security interaction",
        "Cache miss is visible without overpowering the main path",
        "Database access only appears after cache fallback"
      ]
    },
    {
      "dot": "orange",
      "title": "Async Trace",
      "items": [
        "Trace emission is dashed and secondary",
        "It does not block the response path",
        "The diagram separates user-facing latency from observability"
      ]
    }
  ]
}`
  },
  dataflow: {
    schema: `The JSON must follow this structure:
- schema_version: number (always 1)
- diagram_type: "dataflow"
- meta: { title: string, subtitle: string, viewBox?: [number, number] }
- stages: array of { label: string }
- nodes: array of {
    id: string,
    type: "frontend" | "backend" | "database" | "cloud" | "security" | "messagebus" | "external",
    label: string,
    sublabel: string,
    stage: number,
    row: number,
    tag?: string
  }
- flows: array of {
    from: string,
    to: string,
    label?: string,
    classification?: string,
    variant: "default" | "emphasis" | "security" | "dashed",
    fromSide?: "top" | "bottom" | "left" | "right",
    toSide?: "top" | "bottom" | "left" | "right",
    route?: "straight",
    via?: [number, number][],
    labelAt?: [number, number]
  }
- cards?: array of {
    dot: "cyan" | "emerald" | "violet" | "amber" | "rose" | "orange" | "slate",
    title: string,
    items: string[]
  }`,
    example: `{
  "schema_version": 1,
  "diagram_type": "dataflow",
  "meta": {
    "title": "Product Analytics Data Flow",
    "subtitle": "Events, consent, PII isolation, warehouse sync, and downstream analytics",
    "output": "examples/dataflow-product-analytics.html",
    "viewBox": [1080, 760]
  },
  "stages": [
    { "label": "Sources" },
    { "label": "Ingest" },
    { "label": "Process" },
    { "label": "Store" },
    { "label": "Consume" }
  ],
  "nodes": [
    { "id": "web", "type": "frontend", "label": "Web App", "sublabel": "browser SDK", "stage": 0, "row": 0, "tag": "events" },
    { "id": "mobile", "type": "frontend", "label": "Mobile", "sublabel": "iOS / Android", "stage": 0, "row": 2, "tag": "events" },
    { "id": "edge", "type": "cloud", "label": "Edge API", "sublabel": "collector", "stage": 1, "row": 1, "tag": "TLS" },
    { "id": "consent", "type": "security", "label": "Consent Gate", "sublabel": "policy filter", "stage": 2, "row": 0, "tag": "PII guard" },
    { "id": "stream", "type": "messagebus", "label": "Event Stream", "sublabel": "Kafka topic", "stage": 2, "row": 2, "tag": "ordered" },
    { "id": "pii", "type": "security", "label": "PII Vault", "sublabel": "encrypted", "stage": 3, "row": 0, "tag": "restricted" },
    { "id": "warehouse", "type": "database", "label": "Warehouse", "sublabel": "analytics tables", "stage": 3, "row": 2, "tag": "curated" },
    { "id": "features", "type": "database", "label": "Feature Store", "sublabel": "daily batch", "stage": 3, "row": 4, "tag": "derived" },
    { "id": "dashboard", "type": "backend", "label": "Dashboards", "sublabel": "product metrics", "stage": 4, "row": 1, "tag": "SQL" },
    { "id": "model", "type": "backend", "label": "ML Model", "sublabel": "ranking job", "stage": 4, "row": 4, "tag": "features" }
  ],
  "flows": [
    { "from": "web", "to": "edge", "label": "clickstream", "classification": "user events", "variant": "emphasis", "fromSide": "right", "toSide": "left", "via": [[184, 157], [184, 271]], "labelAt": [204, 190] },
    { "from": "mobile", "to": "edge", "label": "app events", "classification": "device events", "variant": "default", "fromSide": "right", "toSide": "left", "via": [[222, 385], [222, 271]], "labelAt": [220, 342] },
    { "from": "edge", "to": "consent", "label": "identity + consent", "classification": "PII touch", "variant": "security", "fromSide": "top", "toSide": "left", "via": [[315, 112], [450, 112], [450, 157]], "labelAt": [382, 100] },
    { "from": "edge", "to": "stream", "label": "accepted events", "classification": "append-only", "variant": "emphasis", "fromSide": "right", "toSide": "left", "via": [[420, 271], [420, 385]], "labelAt": [438, 324] },
    { "from": "consent", "to": "pii", "label": "identity map", "classification": "encrypted PII", "variant": "security", "route": "straight", "labelAt": [638, 144] },
    { "from": "stream", "to": "warehouse", "label": "normalized facts", "classification": "non-PII", "variant": "emphasis", "route": "straight", "labelAt": [638, 372] },
    { "from": "warehouse", "to": "features", "label": "daily aggregates", "classification": "batch", "variant": "dashed", "fromSide": "bottom", "toSide": "top", "route": "straight", "labelAt": [745, 496] },
    { "from": "warehouse", "to": "dashboard", "label": "metrics SQL", "classification": "read-only", "variant": "default", "fromSide": "right", "toSide": "left", "via": [[852, 385], [852, 271]], "labelAt": [830, 326] },
    { "from": "features", "to": "model", "label": "feature vectors", "classification": "derived", "variant": "dashed", "route": "straight", "labelAt": [852, 598] },
    { "from": "pii", "to": "dashboard", "label": "restricted join", "classification": "approved only", "variant": "security", "fromSide": "right", "toSide": "top", "via": [[878, 157], [878, 212], [960, 212]], "labelAt": [880, 198] }
  ],
  "cards": [
    {
      "dot": "emerald",
      "title": "Primary Data Path",
      "items": [
        "Events move left to right through source, ingest, process, store, and consume stages",
        "The hot path stays visually clear even with secondary batch flows",
        "Labels name data assets instead of generic API verbs"
      ]
    },
    {
      "dot": "rose",
      "title": "Sensitive Boundary",
      "items": [
        "Consent and PII paths are styled as security flows",
        "PII lands in a restricted vault, separate from the analytics warehouse",
        "Restricted joins are visible without implying default access"
      ]
    },
    {
      "dot": "orange",
      "title": "Derived Consumers",
      "items": [
        "Dashboards read curated facts from the warehouse",
        "Feature vectors are derived by batch from analytics tables",
        "Consumption paths stay distinct from collection and consent handling"
      ]
    }
  ]
}`
  },
  lifecycle: {
    schema: `The JSON must follow this structure:
- schema_version: number (always 1)
- diagram_type: "lifecycle"
- meta: { title: string, subtitle: string, viewBox?: [number, number] }
- lanes: array of { id: string, label: string }
- states: array of {
    id: string,
    type: "start" | "active" | "decision" | "success" | "waiting" | "failure",
    label: string,
    sublabel: string,
    lane: string,
    col: number,
    step?: string,
    tag?: string,
    yOffset?: number
  }
- transitions: array of {
    from: string,
    to: string,
    variant?: "default" | "emphasis" | "security" | "dashed",
    fromSide?: "top" | "bottom" | "left" | "right",
    toSide?: "top" | "bottom" | "left" | "right",
    route?: "straight" | "drop",
    via?: [number, number][]
  }
- cards?: array of {
    dot: "cyan" | "emerald" | "violet" | "amber" | "rose" | "orange" | "slate",
    title: string,
    items: string[]
  }`,
    example: `{
  "schema_version": 1,
  "diagram_type": "lifecycle",
  "meta": {
    "title": "Agent Run Lifecycle",
    "subtitle": "State machine for planning, tool execution, human approval, retries, and terminal outcomes",
    "output": "examples/lifecycle-agent-run.html",
    "viewBox": [980, 660]
  },
  "lanes": [
    { "id": "main", "label": "Lifecycle phases" },
    { "id": "waiting", "label": "Interruptions" },
    { "id": "exceptions", "label": "Recovery loop" },
    { "id": "terminal", "label": "Terminal exits" }
  ],
  "states": [
    { "id": "queued", "type": "start", "label": "Queued", "sublabel": "request accepted", "lane": "main", "col": 0, "step": "01", "tag": "entry" },
    { "id": "planning", "type": "active", "label": "Planning", "sublabel": "build task graph", "lane": "main", "col": 1, "step": "02", "tag": "model" },
    { "id": "executing", "type": "active", "label": "Executing", "sublabel": "tool calls", "lane": "main", "col": 2, "step": "03", "tag": "work" },
    { "id": "reviewing", "type": "decision", "label": "Reviewing", "sublabel": "quality gate", "lane": "main", "col": 3, "step": "04", "tag": "check" },
    { "id": "completed", "type": "success", "label": "Completed", "sublabel": "final response", "lane": "main", "col": 4, "step": "05", "tag": "done" },
    { "id": "approval", "type": "waiting", "label": "Needs Approval", "sublabel": "human gate", "lane": "waiting", "col": 0, "tag": "pause" },
    { "id": "blocked", "type": "waiting", "label": "Blocked", "sublabel": "missing input", "lane": "waiting", "col": 1, "tag": "wait" },
    { "id": "failed", "type": "failure", "label": "Failed", "sublabel": "recoverable error", "lane": "exceptions", "col": 0, "yOffset": 78, "tag": "retryable" },
    { "id": "cancelled", "type": "failure", "label": "Cancelled", "sublabel": "user stopped", "lane": "terminal", "col": 0, "tag": "terminal" },
    { "id": "expired", "type": "failure", "label": "Expired", "sublabel": "timeout", "lane": "terminal", "col": 1, "tag": "terminal" }
  ],
  "transitions": [
    { "from": "executing", "to": "approval", "variant": "security", "fromSide": "bottom", "toSide": "top", "route": "straight" },
    { "from": "reviewing", "to": "blocked", "variant": "default", "route": "drop" },
    { "from": "executing", "to": "failed", "variant": "security", "fromSide": "left", "toSide": "top", "via": [[340, 342], [402, 342]] },
    { "from": "blocked", "to": "expired", "variant": "security", "fromSide": "bottom", "toSide": "top", "route": "straight" },
    { "from": "approval", "to": "cancelled", "variant": "security", "fromSide": "bottom", "toSide": "top", "route": "straight" }
  ],
  "cards": [
    {
      "dot": "emerald",
      "title": "Main Path",
      "items": [
        "The run has five ordered phases from queue to completion",
        "The primary lifecycle is carried by one horizontal rail",
        "Completion is a phase, not a detached side box"
      ]
    },
    {
      "dot": "amber",
      "title": "Human + Input Gates",
      "items": [
        "Approval pauses execution without ending the run",
        "Blocked waits for missing user input",
        "Wait states can resume back into planning or execution"
      ]
    },
    {
      "dot": "rose",
      "title": "Terminal + Recovery",
      "items": [
        "Failed loops back while retry budget remains",
        "Cancelled and Expired are exits from the lifecycle",
        "Terminal exits do not point back into active execution"
      ]
    }
  ]
}`
  }
};
