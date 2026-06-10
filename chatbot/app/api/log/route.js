import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const LOGS_DIR = path.join(process.cwd(), "logs");
const ALLOWED_TYPES = new Set(["booking", "handoff"]);

/**
 * POST /api/log
 * Body: { type: 'booking' | 'handoff', data, transcript, at }
 * Appends the entry to logs/<type>s.json so the human team can follow up.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type } = body || {};

    if (!ALLOWED_TYPES.has(type)) {
      return Response.json({ ok: false, error: "Invalid log type" }, { status: 400 });
    }

    await mkdir(LOGS_DIR, { recursive: true });
    const file = path.join(LOGS_DIR, `${type}s.json`);

    let entries = [];
    try {
      entries = JSON.parse(await readFile(file, "utf8"));
      if (!Array.isArray(entries)) entries = [];
    } catch {
      // First write — file doesn't exist yet
    }

    entries.push({
      at: body.at || new Date().toISOString(),
      data: body.data ?? null,
      transcript: Array.isArray(body.transcript) ? body.transcript.slice(-100) : [],
    });

    await writeFile(file, JSON.stringify(entries, null, 2), "utf8");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Log write failed:", err);
    return Response.json({ ok: false }, { status: 500 });
  }
}
