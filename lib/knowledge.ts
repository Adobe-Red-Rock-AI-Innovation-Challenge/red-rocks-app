import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const folder = path.join(process.cwd(), "data", "knowledge");

// Every Markdown or text file in data/knowledge (except the README) is given to the assistant.
export function loadKnowledge() {
  try {
    return readdirSync(folder)
      .filter((name) => /\.(md|txt)$/i.test(name) && name.toLowerCase() !== "readme.md")
      .sort()
      .map((name) => `### ${name}\n${readFileSync(path.join(folder, name), "utf8").trim()}`)
      .join("\n\n");
  } catch {
    return "";
  }
}
