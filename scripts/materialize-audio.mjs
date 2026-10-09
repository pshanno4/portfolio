import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const root = process.cwd();
const records = JSON.parse(await readFile(path.join(root, "content/audio/manifest.json"), "utf8"));
await mkdir(path.join(root, "public/audio"), { recursive: true });
for (const record of records) {
  const pieces = [];
  for (const part of record.parts) {
    pieces.push(Buffer.from((await readFile(path.join(root, part), "utf8")).trim(), "base64"));
  }
  const audio = Buffer.concat(pieces);
  const hash = createHash("sha256").update(audio).digest("hex");
  if (audio.length !== record.size || hash !== record.sha256) {
    throw new Error(`Audio integrity check failed: ${record.filename}`);
  }
  await writeFile(path.join(root, "public/audio", record.filename), audio);
}
console.log(`Reconstructed and verified ${records.length} complete MP3 recordings.`);
