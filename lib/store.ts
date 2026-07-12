import fs from "fs";
import os from "os";
import path from "path";

export type ScriptEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code: string;
  tags: string[];
  createdAt: number;
};

const KEY = "scripts:list";

// On Vercel (and most serverless platforms), the deployed project folder is
// read-only — only /tmp is writable, and it's wiped on cold starts/redeploys.
// Without a real database this is the best a filesystem fallback can do; it
// at least avoids crashing with EROFS. Set up Upstash Redis (see README) for
// real persistence.
const LOCAL_FILE = process.env.VERCEL
  ? path.join(os.tmpdir(), "bonehub-scripts.json")
  : path.join(process.cwd(), ".data", "scripts.json");

// Works with either the Vercel Marketplace "Upstash Redis" integration
// (KV_REST_API_URL / KV_REST_API_TOKEN) or a standalone Upstash database
// (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
function redisEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

function readLocal(): ScriptEntry[] {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return [];
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("[store] failed to read local script file:", err);
    return [];
  }
}

function writeLocal(data: ScriptEntry[]) {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2), "utf-8");
}

async function getRedis() {
  const env = redisEnv();
  if (!env) return null;
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url: env.url, token: env.token });
}

export async function listScripts(): Promise<ScriptEntry[]> {
  const redis = await getRedis();
  if (redis) {
    const data = await redis.get<ScriptEntry[]>(KEY);
    return data ?? [];
  }
  return readLocal();
}

async function saveScripts(data: ScriptEntry[]) {
  const redis = await getRedis();
  if (redis) {
    await redis.set(KEY, data);
  } else {
    writeLocal(data);
  }
}

export async function addScript(
  entry: Omit<ScriptEntry, "id" | "createdAt">
): Promise<ScriptEntry> {
  const all = await listScripts();
  const newEntry: ScriptEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  all.unshift(newEntry);
  await saveScripts(all);
  return newEntry;
}

export async function deleteScript(id: string): Promise<void> {
  const all = await listScripts();
  await saveScripts(all.filter((s) => s.id !== id));
}
