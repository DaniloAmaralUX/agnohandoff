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

/* 5b. CRAFT.md — guardrails Jakub×Emil (motion) */
// classe `transition` pura (= transition: all) em className de tsx
const bareTransition = scan("[\"'\\s]transition[\\s\"']", (f) => /\.tsx$/.test(f));
// ease-in como classe de UI (proibido; ease-in-out é permitido)
const easeIn = scan("[\"'\\s]ease-in[\\s\"']", (f) => /\.tsx$/.test(f));
// duração de UI acima de 300ms (350+; 300 é o teto)
const slowUI = scan("duration-(3[5-9]\\d|[4-9]\\d{2}|[1-9]\\d{3,})", (f) => /\.tsx$/.test(f));
// entrada a partir de scale(0) — "nada aparece do nada"
const scaleZero = scan("(zoom-in-0|scale-0)[\\s\"']", (f) => /\.tsx$/.test(f));

/* 5. Cor semântica usada (dot/tint/texto) — a triar no sweep -text */
// semântico VIVO usado como texto (deveria ser -text ou passo de escala -N00).
// crimson já é AA (sem -text) → fora. Aceita -text e -50..-900 como AA.
const semColor = scan("text-(forest|honey|amethyst|bluetron)\\b(?!-text|-\\d)", (f) => /\.tsx$/.test(f));

/* 6. Anti-regressão (craft 2026-07-15) */
// Larguras fixas grandes em classe arbitrária — risco de overflow em 390px
const fixedWide = scan("(?:min-)?w-\\[(\\d{3,})px\\]", (f, m) => /\.tsx$/.test(f) && Number(m[1]) >= 390);
// Aleatoriedade no inicializador de useState — hydration mismatch (SSR≠cliente)
const randomInit = scan("useState[^\\n]*\\(\\s*\\(\\)\\s*=>[^\\n]*(Math\\.random|Date\\.now|crypto\\.randomUUID)", (f) => /\.tsx?$/.test(f));
// Toast que alega persistência em contexto de demo (heurístico por palavras)
const fakePersist = scan(
  "toast\\.(success|info)\\([^)]*(salvo no servidor|persistid|gravad[oa] no banco)",
  (f) => /\.tsx?$/.test(f),
);

const checks = [
  { key: "hex", label: "Hex hardcoded (usar token)", count: hex.length, samples: hex.slice(0, 6), note: "quase zero — migração OKLCH" },
  { key: "transition-all", label: "`transition: all` (listar props)", count: transAll.length, samples: transAll.slice(0, 6), note: "inclui defaults do shadcn" },
  { key: "ellipsis", label: "Reticências `...` (usar `…`)", count: dots.length, samples: dots.slice(0, 6) },
  { key: "icon-aria", label: "Botão só-ícone sem aria-label", count: iconNoLabel.length, samples: iconNoLabel.slice(0, 6), note: "heurístico" },
  { key: "sem-color", label: "Cor semântica a triar (dot/tint/texto)", count: semColor.length, samples: semColor.slice(0, 6), note: "sweep -text" },
  { key: "bare-transition", label: "Classe `transition` pura (= all)", count: bareTransition.length, samples: bareTransition.slice(0, 6), note: "CRAFT.md §5" },
  { key: "ease-in", label: "`ease-in` em UI (proibido)", count: easeIn.length, samples: easeIn.slice(0, 6), note: "CRAFT.md §2" },
  { key: "slow-ui", label: "Duração de UI > 300ms", count: slowUI.length, samples: slowUI.slice(0, 6), note: "CRAFT.md §3" },
  { key: "scale-zero", label: "Entrada de scale(0)/zoom-in-0", count: scaleZero.length, samples: scaleZero.slice(0, 6), note: "CRAFT.md §4" },
  { key: "fixed-wide", label: "Largura fixa ≥390px (risco mobile)", count: fixedWide.length, samples: fixedWide.slice(0, 6), note: "e2e mobile pega em runtime" },
  { key: "random-init", label: "Random/Date em init de useState (hydration)", count: randomInit.length, samples: randomInit.slice(0, 6) },
  { key: "fake-persist", label: "Toast que alega persistência (demo honesta)", count: fakePersist.length, samples: fakePersist.slice(0, 6), note: "heurístico" },
];

const out = { generatedAt: new Date().toISOString(), checks };
writeFileSync(join(SRC, "app", "design", "audit.json"), JSON.stringify(out, null, 2) + "\n");

console.log("\n  Design audit — sinal medido (heurístico)\n");
for (const c of checks) console.log(`  ${String(c.count).padStart(4)}  ${c.label}${c.note ? `  — ${c.note}` : ""}`);
console.log(`\n  → src/app/design/audit.json atualizado (${out.generatedAt}).\n`);
