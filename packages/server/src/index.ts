import express from "express";
import cors from "cors";
import { writeFileSync, rmSync, readFileSync, mkdtempSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { config, DiagramType } from "./config.js";
import { generateJson, localizeHtml } from "./llm.js";
import { promptTemplates } from "./prompt-templates.js";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/render", (req, res) => {
  try {
    const { diagramType, json, language } = req.body;

    if (!diagramType || !config.diagramTypes.includes(diagramType)) {
      res.status(400).json({ error: `Invalid diagramType. Must be one of: ${config.diagramTypes.join(", ")}` });
      return;
    }

    if (!json || typeof json !== "object") {
      res.status(400).json({ error: "json field is required and must be an object" });
      return;
    }

    const tmpDir = mkdtempSync(join(tmpdir(), "archify-render-"));
    const inputPath = join(tmpDir, "input.json");
    const outputPath = join(tmpDir, "output.html");

    writeFileSync(inputPath, JSON.stringify(json), "utf-8");

    const rendererPath = join(
      config.renderer.root,
      diagramType,
      `render-${diagramType}.mjs`
    );

    execSync(`node "${rendererPath}" "${inputPath}" "${outputPath}"`, {
      stdio: "pipe",
      timeout: 30000,
    });

    let html = readFileSync(outputPath, "utf-8");
    rmSync(tmpDir, { recursive: true, force: true });

    // 根据语言替换模板中的静态文字
    if (language === "zh") {
      html = localizeHtml(html);
    }

    res.json({ html });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Render failed", details: message });
  }
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, diagramType, language } = req.body;

    if (!diagramType || !config.diagramTypes.includes(diagramType)) {
      res.status(400).json({ error: `Invalid diagramType. Must be one of: ${config.diagramTypes.join(", ")}` });
      return;
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ error: "prompt is required and must be a non-empty string" });
      return;
    }

    const template = promptTemplates[diagramType];
    const lang = language === "zh" ? "zh" : "en";
    const result = await generateJson(prompt.trim(), diagramType as DiagramType, template.schema, template.example, lang);

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Generation failed", details: message });
  }
});

app.listen(config.port, () => {
  console.log(`Archify server listening on port ${config.port}`);
});
