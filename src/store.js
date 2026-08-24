import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, "..", "data", "state.json");

const DEFAULT_STATE = { tokenPosition: 0, lastRoll: null };

export async function readState() {
  try {
    const raw = await readFile(STATE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeState(DEFAULT_STATE);
      return DEFAULT_STATE;
    }
    throw err;
  }
}

export async function writeState(state) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  return state;
}
