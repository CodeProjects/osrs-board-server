import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_FILE = path.join(__dirname, "..", "data", "board.json");

let cachedBoard = null;

export async function loadBoard() {
  if (cachedBoard) return cachedBoard;

  const raw = await readFile(BOARD_FILE, "utf-8");
  const tiles = JSON.parse(raw);

  const width = Math.sqrt(tiles.length);
  const height = width;

  const specialTiles = new Map();
  for (const tile of tiles) {
    const isSpecial =
      (tile.type === "ladder" || tile.type === "chute") &&
      tile.target !== null &&
      tile.target !== undefined;
    if (isSpecial) {
      specialTiles.set(tile.tile_number, {
        type: tile.type,
        target: tile.target,
      });
    }
  }

  cachedBoard = { tiles, width, height, specialTiles };
  return cachedBoard;
}
