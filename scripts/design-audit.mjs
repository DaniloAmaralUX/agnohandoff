/* Audit de design — mede drift real vs. o que dizemos aplicar (/design).
   Uso: `pnpm design:audit`. Escreve src/app/design/audit.json (sinal na doc).
   É um SINAL (heurístico), não um linter perfeito. Sempre exit 0. */
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const SRC = "src";
const rel = (p) => p.split("\\").join("/");
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(e)) out.push(p);
  }
  return out;
}
const files = walk(SRC);
const read = (p) => readFileSync(p, "utf8");
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;

function scan(re, filter = () => true, exclude = () => false) {
  const hits = [];
  for (const f of files) {
    if (exclude(f)) continue;
    const t = read(f);
    let m;
    const r = new RegExp(re, "g");
    while ((m = r.exec(t))) {
      if (!filter(f, m, t)) continue;
      hits.push(`${rel(f)}:${lineOf(t, m.index)}`);
    }
  }
  return hits;
}

/* 1. Hex hardcoded (deveria ser token) — fora de globals.css/gerados */
const hex = scan(
  "#[0-9a-fA-F]{6}\\b",
  (f) => /\.(tsx?)$/.test(f),
  (f) => /globals\.css$|api[\\/]schema\.ts$/.test(f),
);

/* 2. transition: all (deveria listar propriedades) */
const transAll = scan("transition-all|transition:\\s*all");

/* 3. Reticências literais `...` (deveria ser `…`) — exclui spread/ranges */
const dots = scan("\\.\\.\\.(?![\\w{\\[($.])", (f) => /\.tsx$/.test(f));

/* 4. Botões só-ícone sem aria-label (heurístico) */
const iconNoLabel = [];
for (const f of files.filter((f) => /\.tsx$/.test(f))) {
  const t = read(f);
  const r = /size=["']icon[^"']*["']/g;
  let m;
  while ((m = r.exec(t))) {
    const start = t.lastIndexOf("<", m.index);
    // checa o BOTÃO inteiro (até </Button>), pegando aria-label OU <span className="sr-only">
    const closeIdx = t.indexOf("</Button>", m.index);
    const end = closeIdx >= 0 && closeIdx - m.index < 800 ? closeIdx : m.index + 400;
    const region = t.slice(start, end);
    if (!/aria-label|aria-labelledby|sr-only/.test(region)) iconNoLabel.push(`${rel(f)}:${lineOf(t, m.index)}`);
  }
}

/* 5. Cor semântica usada (dot/tint/texto) — a triar no sweep -text */
// semântico VIVO usado como texto (deveria ser -text). crimson já é AA (sem -text) → fora.
const semColor = scan("text-(forest|honey|amethyst|bluetron)\\b(?!-text)", (f) => /\.tsx$/.test(f));

const checks = [
  { key: "hex", label: "Hex hardcoded (usar token)", count: hex.length, samples: hex.slice(0, 6), note: "quase zero — migração OKLCH" },
  { key: "transition-all", label: "`transition: all` (listar props)", count: transAll.length, samples: transAll.slice(0, 6), note: "inclui defaults do shadcn" },
  { key: "ellipsis", label: "Reticências `...` (usar `…`)", count: dots.length, samples: dots.slice(0, 6) },
  { key: "icon-aria", label: "Botão só-ícone sem aria-label", count: iconNoLabel.length, samples: iconNoLabel.slice(0, 6), note: "heurístico" },
  { key: "sem-color", label: "Cor semântica a triar (dot/tint/texto)", count: semColor.length, samples: semColor.slice(0, 6), note: "sweep -text" },
];

const out = { generatedAt: new Date().toISOString(), checks };
writeFileSync(join(SRC, "app", "design", "audit.json"), JSON.stringify(out, null, 2) + "\n");

console.log("\n  Design audit — sinal medido (heurístico)\n");
for (const c of checks) console.log(`  ${String(c.count).padStart(4)}  ${c.label}${c.note ? `  — ${c.note}` : ""}`);
console.log(`\n  → src/app/design/audit.json atualizado (${out.generatedAt}).\n`);
