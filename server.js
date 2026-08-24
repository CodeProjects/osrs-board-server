import express from "express";
import cors from "cors";
import { loadBoard } from "./src/board.js";
import { rollDie, advanceToken } from "./src/gameplay.js";
import { readState, writeState } from "./src/store.js";

const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const app = express();
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Bootstrap for page load
app.get("/api/game", async (_req, res, next) => {
  try {
    const { tiles } = await loadBoard();
    const { tokenPosition, lastRoll } = await readState();
    res.json({ tiles, tokenPosition, lastRoll });
  } catch (err) {
    next(err);
  }
});

app.post("/api/game/roll", async (_req, res, next) => {
  try {
    const board = await loadBoard();
    const { tokenPosition } = await readState();
    const roll = rollDie();
    const nextPosition = advanceToken({
      tokenPosition,
      width: board.width,
      height: board.height,
      specialTiles: board.specialTiles,
      roll,
    });
    const nextState = await writeState({
      tokenPosition: nextPosition,
      lastRoll: roll,
    });
    res.json(nextState);
  } catch (err) {
    next(err);
  }
});

app.post("/api/game/reset", async (_req, res, next) => {
  try {
    const nextState = await writeState({ tokenPosition: 0, lastRoll: null });
    res.json(nextState);
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`osrs-board-server listening on http://localhost:${PORT}`);
});
