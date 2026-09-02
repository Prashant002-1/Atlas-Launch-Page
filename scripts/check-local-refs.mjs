import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", ".vercel", "node_modules"]);
const sourceFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(absolute);
    } else if (/\.(?:css|html)$/.test(entry.name)) {
      sourceFiles.push(absolute);
    }
  }
}

function collectReferences(source) {
  const references = [];
  const attributes = /\b(?:href|poster|src)\s*=\s*["']([^"']+)["']/gi;
  const cssUrls = /url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi;

  for (const match of source.matchAll(attributes)) references.push(match[1]);
  for (const match of source.matchAll(cssUrls)) references.push(match[2]);
  return references;
}

function resolveReference(reference) {
  if (!reference.startsWith("/") || reference.startsWith("//")) return null;
  const pathname = reference.split(/[?#]/, 1)[0];
  if (!pathname || pathname.startsWith("/_vercel/") || pathname.startsWith("/api/")) {
    return null;
  }

  const relative = decodeURIComponent(pathname.slice(1));
  return pathname.endsWith("/")
    ? path.join(root, relative, "index.html")
    : path.join(root, relative);
}

walk(root);

const missing = [];
let checked = 0;

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const reference of collectReferences(source)) {
    const target = resolveReference(reference);
    if (!target) continue;
    checked += 1;
    if (!fs.existsSync(target)) {
      missing.push(`${path.relative(root, file)}: ${reference}`);
    }
  }
}

if (missing.length > 0) {
  console.error("Missing local references:\n" + missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${checked} local references across ${sourceFiles.length} HTML/CSS files.`,
  );
}
