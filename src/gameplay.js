/** D6. */
export function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

export function advanceToken({
  tokenPosition,
  width,
  height,
  specialTiles,
  roll,
}) {
  const goal = width * height + 1;
  const moved = Math.min(tokenPosition + roll, goal);
  const special = specialTiles.get(moved);
  return special ? special.target : moved;
}
