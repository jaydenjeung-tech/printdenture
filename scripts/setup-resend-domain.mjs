import { readFileSync, writeFileSync } from "node:fs";

function parseEnv(content) {
  const env = {};
  for (const rawLine of content.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = parseEnv(readFileSync(".env.production.local", "utf8"));

const apiKey = env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY missing");
  process.exit(1);
}

async function resend(path, init = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

const list = await resend("/domains");
if (!list.ok) {
  console.error("List domains failed", list.status, list.body?.message || list.body);
  process.exit(1);
}

const existing = (list.body.data ?? list.body ?? []).find?.(
  (d) => d.name === "printdenture.com"
) ?? (Array.isArray(list.body.data) ? list.body.data.find((d) => d.name === "printdenture.com") : null);

let domain = existing;
if (!domain) {
  const created = await resend("/domains", {
    method: "POST",
    body: JSON.stringify({ name: "printdenture.com", region: "us-east-1" }),
  });
  if (!created.ok) {
    console.error("Create domain failed", created.status, created.body?.message || created.body);
    process.exit(1);
  }
  domain = created.body;
  console.log("Created domain", domain.id, domain.status);
} else {
  const got = await resend(`/domains/${domain.id}`);
  domain = got.ok ? got.body : domain;
  console.log("Existing domain", domain.id, domain.status);
}

const records = (domain.records ?? []).map((r) => ({
  record: r.record,
  name: r.name,
  type: r.type,
  value: String(r.value ?? "").replace(/^"|"$/g, ""),
  priority: r.priority ?? null,
  status: r.status,
}));

writeFileSync("scripts/.resend-dns.json", JSON.stringify({ id: domain.id, status: domain.status, records }, null, 2));
console.log("Wrote", records.length, "DNS records");
for (const r of records) {
  console.log(`${r.type}\t${r.name}\t${r.priority ?? ""}\t${r.value}`);
}
