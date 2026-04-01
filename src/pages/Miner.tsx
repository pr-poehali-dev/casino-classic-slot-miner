import { useState, useCallback } from "react";
import { Link } from "react-router-dom";

type CellState = "hidden" | "revealed" | "mine" | "diamond";
type GameState = "idle" | "playing" | "won" | "lost";

interface Cell {
  isMine: boolean;
  state: CellState;
}

const GRID_SIZE = 25; // 5x5

// Multiplier curve — each safe pick increases multiplier
function getMultiplier(safeRevealed: number, totalMines: number): number {
  if (safeRevealed === 0) return 1;
  const safeTotal = GRID_SIZE - totalMines;
  let mult = 1;
  for (let i = 0; i < safeRevealed; i++) {
    mult *= (safeTotal - i) / (GRID_SIZE - i) > 0
      ? 1 + (totalMines / (GRID_SIZE - i)) * 1.3
      : 1;
  }
  return Math.max(1, mult);
}

function formatMult(m: number) {
  return `×${m.toFixed(2)}`;
}

function buildGrid(mines: number): Cell[] {
  const cells: Cell[] = Array.from({ length: GRID_SIZE }, () => ({
    isMine: false,
    state: "hidden",
  }));

  let placed = 0;
  while (placed < mines) {
    const idx = Math.floor(Math.random() * GRID_SIZE);
    if (!cells[idx].isMine) {
      cells[idx].isMine = true;
      placed++;
    }
  }
  return cells;
}

const MINE_COUNTS = [3, 5, 10, 15];

export default function Miner() {
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(5);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [safeRevealed, setSafeRevealed] = useState(0);
  const [currentWin, setCurrentWin] = useState(0);
  const [history, setHistory] = useState<Array<{ win: number; picks: number; mines: number }>>([]);

  const multiplier = getMultiplier(safeRevealed, mineCount);
  const potentialWin = Math.floor(bet * multiplier);

  const startGame = useCallback(() => {
    if (balance < bet) return;
    setBalance((b) => b - bet);
    setGrid(buildGrid(mineCount));
    setGameState("playing");
    setSafeRevealed(0);
    setCurrentWin(0);
  }, [balance, bet, mineCount]);

  const cashOut = useCallback(() => {
    if (gameState !== "playing" || safeRevealed === 0) return;
    const win = potentialWin;
    setBalance((b) => b + win);
    setCurrentWin(win);
    setGameState("won");
    setHistory((h) => [{ win, picks: safeRevealed, mines: mineCount }, ...h.slice(0, 9)]);

    // Reveal all cells
    setGrid((g) =>
      g.map((cell) => ({
        ...cell,
        state: cell.isMine ? "mine" : cell.state === "revealed" ? "revealed" : "diamond",
      }))
    );
  }, [gameState, safeRevealed, potentialWin, mineCount]);

  const revealCell = useCallback(
    (idx: number) => {
      if (gameState !== "playing") return;
      const cell = grid[idx];
      if (cell.state !== "hidden") return;

      if (cell.isMine) {
        // BOOM
        const newGrid = grid.map((c, i) => ({
          ...c,
          state: (i === idx ? "mine" : c.isMine ? "mine" : c.state) as CellState,
        }));
        setGrid(newGrid);
        setGameState("lost");
        setCurrentWin(0);
        setHistory((h) => [{ win: 0, picks: safeRevealed, mines: mineCount }, ...h.slice(0, 9)]);
      } else {
        const newSafe = safeRevealed + 1;
        const newGrid = grid.map((c, i) =>
          i === idx ? { ...c, state: "revealed" as CellState } : c
        );
        setGrid(newGrid);
        setSafeRevealed(newSafe);

        // Auto-win if all safe cells revealed
        const safeTotal = GRID_SIZE - mineCount;
        if (newSafe === safeTotal) {
          const win = Math.floor(bet * getMultiplier(newSafe, mineCount));
          setBalance((b) => b + win);
          setCurrentWin(win);
          setGameState("won");
          setHistory((h) => [{ win, picks: newSafe, mines: mineCount }, ...h.slice(0, 9)]);
          setGrid(
            newGrid.map((c) => ({
              ...c,
              state: c.isMine ? "mine" : "revealed",
            }))
          );
        }
      }
    },
    [gameState, grid, safeRevealed, bet, mineCount]
  );

  const betOptions = [50, 100, 250, 500, 1000];
  const safeTotal = GRID_SIZE - mineCount;

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <div className="grain-overlay fixed inset-0 pointer-events-none z-50" />

      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(14,12,8,0.95)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(232,168,48,0.15)",
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl" style={{ color: "rgba(235,225,205,0.5)" }}>←</span>
            <span className="text-lg font-black" style={{ color: "#ebe1cd" }}>ROYAL</span>
            <span className="text-lg font-black" style={{ color: "#e8a830" }}>BET</span>
          </Link>

          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              background: "rgba(232,168,48,0.1)",
              border: "1px solid rgba(232,168,48,0.25)",
            }}
          >
            <span className="text-sm" style={{ color: "rgba(235,225,205,0.6)" }}>Баланс:</span>
            <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
              {balance.toLocaleString("ru")} ₽
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-1" style={{ color: "#ebe1cd" }}>
            💎 Минёр
          </h1>
          <p className="text-sm" style={{ color: "rgba(235,225,205,0.4)" }}>
            Открывай клетки с бриллиантами и не наступай на мины
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="flex flex-col gap-4">
            {/* Bet */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: "1px solid rgba(232,168,48,0.12)",
              }}
            >
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(232,168,48,0.7)" }}>
                Ставка
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {betOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => gameState === "idle" && setBet(b)}
                    disabled={gameState !== "idle"}
                    className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all hover:scale-105 disabled:opacity-40"
                    style={{
                      background: bet === b ? "linear-gradient(135deg, #e8a830, #c47a10)" : "rgba(232,168,48,0.08)",
                      color: bet === b ? "#0e0c08" : "rgba(235,225,205,0.6)",
                      border: `1px solid ${bet === b ? "#e8a830" : "rgba(232,168,48,0.15)"}`,
                    }}
                  >
                    {b.toLocaleString("ru")}
                  </button>
                ))}
              </div>
              <p className="text-xs" style={{ color: "rgba(235,225,205,0.3)" }}>Ставка: {bet.toLocaleString("ru")} ₽</p>
            </div>

            {/* Mines */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: "1px solid rgba(232,168,48,0.12)",
              }}
            >
              <h3 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(232,168,48,0.7)" }}>
                Количество мин
              </h3>
              <div className="flex gap-2 flex-wrap">
                {MINE_COUNTS.map((m) => (
                  <button
                    key={m}
                    onClick={() => gameState === "idle" && setMineCount(m)}
                    disabled={gameState !== "idle"}
                    className="flex-1 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 disabled:opacity-40"
                    style={{
                      background: mineCount === m ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.07)",
                      color: mineCount === m ? "#ef4444" : "rgba(239,68,68,0.5)",
                      border: `1px solid ${mineCount === m ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.15)"}`,
                    }}
                  >
                    💣 {m}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: "rgba(235,225,205,0.3)" }}>
                Безопасных клеток: {safeTotal} из {GRID_SIZE}
              </p>
            </div>

            {/* Multiplier display */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: "1px solid rgba(232,168,48,0.12)",
              }}
            >
              <h3 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "rgba(232,168,48,0.7)" }}>
                Текущий выигрыш
              </h3>
              <div className="text-center">
                <div
                  className="text-3xl font-black mb-1"
                  style={{
                    color: safeRevealed > 0 ? "#e8a830" : "rgba(235,225,205,0.3)",
                    textShadow: safeRevealed > 0 ? "0 0 20px rgba(232,168,48,0.4)" : "none",
                    transition: "all 0.3s",
                  }}
                >
                  {safeRevealed > 0 ? formatMult(multiplier) : "—"}
                </div>
                <div className="text-sm font-bold" style={{ color: safeRevealed > 0 ? "#22c55e" : "rgba(235,225,205,0.25)" }}>
                  {safeRevealed > 0 ? `${potentialWin.toLocaleString("ru")} ₽` : "0 ₽"}
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(235,225,205,0.25)" }}>
                  Открыто: {safeRevealed} / {safeTotal}
                </div>
              </div>
            </div>

            {/* Action button */}
            {gameState === "idle" && (
              <button
                onClick={startGame}
                disabled={balance < bet}
                className="w-full py-4 rounded-xl text-base font-black tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #e8a830, #c47a10)",
                  color: "#0e0c08",
                  boxShadow: "0 4px 20px rgba(232,168,48,0.25)",
                }}
              >
                ▶ Начать игру
              </button>
            )}

            {gameState === "playing" && (
              <button
                onClick={cashOut}
                disabled={safeRevealed === 0}
                className="w-full py-4 rounded-xl text-base font-black tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
                style={{
                  background: safeRevealed > 0 ? "linear-gradient(135deg, #22c55e, #16a34a)" : "rgba(34,197,94,0.15)",
                  color: safeRevealed > 0 ? "#fff" : "rgba(34,197,94,0.4)",
                  boxShadow: safeRevealed > 0 ? "0 4px 20px rgba(34,197,94,0.2)" : "none",
                }}
              >
                💰 Забрать {safeRevealed > 0 ? `${potentialWin.toLocaleString("ru")} ₽` : ""}
              </button>
            )}

            {(gameState === "won" || gameState === "lost") && (
              <button
                onClick={() => {
                  setGameState("idle");
                  setGrid([]);
                  setSafeRevealed(0);
                  setCurrentWin(0);
                }}
                className="w-full py-4 rounded-xl text-base font-black tracking-wider uppercase transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(232,168,48,0.1)",
                  color: "#e8a830",
                  border: "1px solid rgba(232,168,48,0.3)",
                }}
              >
                🔄 Новая игра
              </button>
            )}
          </div>

          {/* Center: Grid */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl p-6"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: `1px solid ${
                  gameState === "lost"
                    ? "rgba(239,68,68,0.35)"
                    : gameState === "won"
                    ? "rgba(34,197,94,0.35)"
                    : "rgba(232,168,48,0.15)"
                }`,
                boxShadow:
                  gameState === "lost"
                    ? "0 0 40px rgba(239,68,68,0.08)"
                    : gameState === "won"
                    ? "0 0 40px rgba(34,197,94,0.08)"
                    : "none",
                transition: "all 0.4s",
              }}
            >
              {/* Status bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  {gameState === "idle" && (
                    <span className="text-sm" style={{ color: "rgba(235,225,205,0.3)" }}>
                      Нажмите «Начать игру»
                    </span>
                  )}
                  {gameState === "playing" && (
                    <span className="text-sm font-medium" style={{ color: "#e8a830" }}>
                      ● Игра идёт... Выбирай клетки!
                    </span>
                  )}
                  {gameState === "won" && (
                    <span className="text-sm font-bold" style={{ color: "#22c55e" }}>
                      🎉 Победа! +{currentWin.toLocaleString("ru")} ₽
                    </span>
                  )}
                  {gameState === "lost" && (
                    <span className="text-sm font-bold" style={{ color: "#ef4444" }}>
                      💥 Мина! Проигрыш -{bet.toLocaleString("ru")} ₽
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(235,225,205,0.3)" }}>
                  <span>💣 {mineCount}</span>
                  <span className="mx-1">·</span>
                  <span>💎 {safeTotal}</span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 gap-2">
                {gameState === "idle"
                  ? Array.from({ length: GRID_SIZE }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl flex items-center justify-center"
                        style={{
                          background: "rgba(232,168,48,0.04)",
                          border: "1px solid rgba(232,168,48,0.08)",
                        }}
                      >
                        <span className="text-xl opacity-20">?</span>
                      </div>
                    ))
                  : grid.map((cell, i) => {
                      const isRevealed = cell.state === "revealed";
                      const isMineShown = cell.state === "mine";
                      const isDiamondShown = cell.state === "diamond";
                      const isHidden = cell.state === "hidden";

                      return (
                        <button
                          key={i}
                          onClick={() => revealCell(i)}
                          disabled={gameState !== "playing" || !isHidden}
                          className="aspect-square rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden"
                          style={{
                            background: isMineShown
                              ? "rgba(239,68,68,0.2)"
                              : isRevealed
                              ? "rgba(34,197,94,0.15)"
                              : isDiamondShown
                              ? "rgba(34,197,94,0.08)"
                              : "rgba(232,168,48,0.06)",
                            border: `1px solid ${
                              isMineShown
                                ? "rgba(239,68,68,0.4)"
                                : isRevealed
                                ? "rgba(34,197,94,0.3)"
                                : isDiamondShown
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(232,168,48,0.12)"
                            }`,
                            boxShadow: isRevealed
                              ? "0 0 12px rgba(34,197,94,0.1)"
                              : "none",
                            cursor: isHidden && gameState === "playing" ? "pointer" : "default",
                            transform: isRevealed || isMineShown ? "scale(1)" : "scale(1)",
                          }}
                          onMouseEnter={(e) => {
                            if (isHidden && gameState === "playing") {
                              e.currentTarget.style.background = "rgba(232,168,48,0.14)";
                              e.currentTarget.style.border = "1px solid rgba(232,168,48,0.3)";
                              e.currentTarget.style.transform = "scale(1.05)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isHidden) {
                              e.currentTarget.style.background = "rgba(232,168,48,0.06)";
                              e.currentTarget.style.border = "1px solid rgba(232,168,48,0.12)";
                              e.currentTarget.style.transform = "scale(1)";
                            }
                          }}
                        >
                          {isHidden && (
                            <span className="text-lg" style={{ color: "rgba(235,225,205,0.2)" }}>
                              ?
                            </span>
                          )}
                          {isRevealed && <span className="text-2xl">💎</span>}
                          {isDiamondShown && (
                            <span className="text-2xl opacity-40">💎</span>
                          )}
                          {isMineShown && <span className="text-2xl">💣</span>}
                        </button>
                      );
                    })}
              </div>

              {/* Multiplier progress bar */}
              {gameState === "playing" && safeRevealed > 0 && (
                <div className="mt-5">
                  <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(235,225,205,0.35)" }}>
                    <span>Прогресс</span>
                    <span>{safeRevealed} / {safeTotal}</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.15)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(safeRevealed / safeTotal) * 100}%`,
                        background: "linear-gradient(90deg, #22c55e, #16a34a)",
                        boxShadow: "0 0 8px rgba(34,197,94,0.4)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div
                className="mt-4 rounded-2xl p-5"
                style={{
                  background: "linear-gradient(160deg, #1c1710, #141109)",
                  border: "1px solid rgba(232,168,48,0.08)",
                }}
              >
                <h3 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "rgba(232,168,48,0.5)" }}>
                  История
                </h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2"
                      style={{
                        background: h.win > 0 ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.06)",
                        border: `1px solid ${h.win > 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.15)"}`,
                      }}
                    >
                      <span>{h.win > 0 ? "💎" : "💣"}</span>
                      <span style={{ color: "rgba(235,225,205,0.5)" }}>{h.picks} кл.</span>
                      <span
                        style={{ color: h.win > 0 ? "#22c55e" : "#ef4444" }}
                        className="font-bold"
                      >
                        {h.win > 0 ? `+${h.win.toLocaleString("ru")}` : "проигрыш"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
