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

app.post("/api/game/set", async (req, res, next) => {
  try {
    const board = await loadBoard();
    const goal = board.width * board.height + 1;
    const { tokenPosition, lastRoll } = req.body ?? {};

    if (
      !Number.isInteger(tokenPosition) ||
      tokenPosition < 0 ||
      tokenPosition > goal
    ) {
      return res.status(400).json({
        error: `tokenPosition must be an integer between 0 and ${goal}`,
      });
    }

    const resolvedRoll = lastRoll === undefined ? 6 : lastRoll;
    if (!Number.isInteger(resolvedRoll) || resolvedRoll < 1 || resolvedRoll > 6) {
      return res
        .status(400)
        .json({ error: "lastRoll must be an integer between 1 and 6" });
    }

    const nextState = await writeState({
      tokenPosition,
      lastRoll: resolvedRoll,
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
