#!/usr/bin/env node
// 释放指定端口，重试机制确保端口真正释放
import { execSync } from "node:child_process";

const ports = process.argv.slice(2).map(Number).filter(Boolean);

if (ports.length === 0) {
  console.error("Usage: node kill-port.mjs <port1> <port2> ...");
  process.exit(1);
}

for (const port of ports) {
  // 最多重试 3 次，应对 tsx watch 自动重启抢端口的情况
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const pid = execSync(`lsof -ti:${port}`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 3000,
      }).trim();

      if (pid) {
        execSync(`kill -9 ${pid}`, { stdio: "ignore", timeout: 3000 });
        console.log(`  freed port ${port} (pid ${pid})`);
        // 等进程真正退出
        execSync(`sleep 0.5`, { stdio: "ignore" });
      } else {
        break; // 端口已空闲
      }
    } catch {
      break; // 端口已空闲
    }
  }
}
