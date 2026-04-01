import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
type GameState = "waiting" | "flying" | "crashed";

interface HistoryItem {
  multiplier: number;
  crashed: boolean;
  win: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BET_OPTIONS = [50, 100, 250, 500, 1000];
const COUNTDOWN_SECONDS = 5;
const TICK_MS = 50; // update interval in ms

// Generate a crash multiplier: house edge ~5%, exponentially distributed
function generateCrashPoint(): number {
  const r = Math.random();
  if (r < 0.01) return 1.0; // 1% chance instant crash
  // Use inverse CDF for ~exponential distribution with mean ~3x
  const raw = 0.99 / (1 - r);
  return Math.max(1.0, Math.round(raw * 100) / 100);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Crash() {
  const navigate = useNavigate();

  // ── State
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(100);
  const [customBet, setCustomBet] = useState("");
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashOutMultiplier, setCashOutMultiplier] = useState<number | null>(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "win" | "lose" | "info" } | null>(null);

  // Plane position in canvas
  const [planeX, setPlaneX] = useState(0);
  const [planeY, setPlaneY] = useState(0);

  // Refs for intervals & crash point
  const crashPointRef = useRef<number>(2.0);
  const startTimeRef = useRef<number>(0);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailPointsRef = useRef<{ x: number; y: number }[]>([]);
  const animFrameRef = useRef<number>(0);

  // ── Clear intervals on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Message auto-clear
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  // ── Canvas drawing
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Background grid lines
    ctx.strokeStyle = "rgba(232,168,48,0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    if (trailPointsRef.current.length < 2) return;

    // Glow trail gradient
    const grad = ctx.createLinearGradient(0, H, W, 0);
    if (gameState === "crashed") {
      grad.addColorStop(0, "rgba(239,68,68,0)");
      grad.addColorStop(1, "rgba(239,68,68,0.8)");
    } else {
      grad.addColorStop(0, "rgba(232,168,48,0)");
      grad.addColorStop(1, "rgba(232,168,48,0.8)");
    }

    // Draw filled area under trail
    ctx.beginPath();
    ctx.moveTo(trailPointsRef.current[0].x, H);
    trailPointsRef.current.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(trailPointsRef.current[trailPointsRef.current.length - 1].x, H);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (gameState === "crashed") {
      fillGrad.addColorStop(0, "rgba(239,68,68,0.18)");
      fillGrad.addColorStop(1, "rgba(239,68,68,0.02)");
    } else {
      fillGrad.addColorStop(0, "rgba(232,168,48,0.12)");
      fillGrad.addColorStop(1, "rgba(232,168,48,0.01)");
    }
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw trail line
    ctx.beginPath();
    ctx.moveTo(trailPointsRef.current[0].x, trailPointsRef.current[0].y);
    trailPointsRef.current.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.shadowBlur = 10;
    ctx.shadowColor = gameState === "crashed" ? "rgba(239,68,68,0.6)" : "rgba(232,168,48,0.6)";
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [gameState]);

  // ── Multiplier to plane position in canvas
  const multiplierToPos = useCallback(
    (m: number, W: number, H: number) => {
      // x grows with time (use multiplier as proxy)
      const progress = Math.min((m - 1) / 8, 1); // 1x → 9x mapped to 0→1 on x
      const x = 40 + progress * (W - 60);
      // y: exponential curve from bottom-left to top-right
      const yNorm = Math.min(Math.pow((m - 1) / 2.5, 0.6), 1);
      const y = H - 30 - yNorm * (H - 60);
      return { x, y };
    },
    []
  );

  // ── Start countdown
  const startCountdown = useCallback(() => {
    setGameState("waiting");
    setMultiplier(1.0);
    setCashedOut(false);
    setCashOutMultiplier(null);
    setBetPlaced(false);
    setCountdown(COUNTDOWN_SECONDS);
    trailPointsRef.current = [];

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          startFlight();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []); // eslint-disable-line

  // ── Start flight
  const startFlight = useCallback(() => {
    crashPointRef.current = generateCrashPoint();
    startTimeRef.current = Date.now();
    trailPointsRef.current = [];
    setGameState("flying");

    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
      // Multiplier grows exponentially: 1 * e^(0.08 * elapsed)
      const newMult = Math.round(Math.pow(Math.E, 0.08 * elapsed) * 100) / 100;

      const canvas = canvasRef.current;
      const W = canvas?.width ?? 600;
      const H = canvas?.height ?? 300;
      const pos = multiplierToPos(newMult, W, H);
      setPlaneX(pos.x);
      setPlaneY(pos.y);
      trailPointsRef.current.push({ x: pos.x, y: pos.y });
      drawCanvas();

      setMultiplier(newMult);

      if (newMult >= crashPointRef.current) {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        handleCrash(newMult);
      }
    }, TICK_MS);
  }, [drawCanvas, multiplierToPos]); // eslint-disable-line

  // ── Handle crash
  const handleCrash = useCallback(
    (finalMult: number) => {
      setGameState("crashed");
      setMultiplier(finalMult);
      drawCanvas();

      setBetPlaced((placed) => {
        setCashedOut((cashed) => {
          if (placed && !cashed) {
            setMessage({ text: `Разбился! ×${finalMult.toFixed(2)} — вы проиграли ставку`, type: "lose" });
            setHistory((h) => [{ multiplier: finalMult, crashed: true, win: null }, ...h].slice(0, 12));
          } else {
            setHistory((h) => [{ multiplier: finalMult, crashed: true, win: null }, ...h].slice(0, 12));
          }
          return cashed;
        });
        return placed;
      });

      setTimeout(() => startCountdown(), 4000);
    },
    [drawCanvas, startCountdown]
  );

  // ── Start game on mount
  useEffect(() => {
    startCountdown();
  }, []); // eslint-disable-line

  // ── Redraw when multiplier changes
  useEffect(() => {
    drawCanvas();
  }, [multiplier, drawCanvas]);

  // ── Place bet
  const handlePlaceBet = () => {
    if (gameState !== "waiting") return;
    if (betPlaced) return;
    if (bet > balance) {
      setMessage({ text: "Недостаточно средств", type: "info" });
      return;
    }
    setBalance((b) => b - bet);
    setBetPlaced(true);
    setMessage({ text: `Ставка ${bet} К принята`, type: "info" });
  };

  // ── Cash out
  const handleCashOut = () => {
    if (gameState !== "flying") return;
    if (!betPlaced || cashedOut) return;
    const win = Math.floor(bet * multiplier);
    setCashedOut(true);
    setCashOutMultiplier(multiplier);
    setBalance((b) => b + win);
    setMessage({ text: `Забрали ×${multiplier.toFixed(2)} — выигрыш ${win} К!`, type: "win" });
    setHistory((h) => [{ multiplier, crashed: false, win }, ...h].slice(0, 12));
  };

  // ── Bet from custom input
  const handleCustomBet = (val: string) => {
    setCustomBet(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setBet(n);
  };

  // ── Multiplier color
  const multColor =
    gameState === "crashed"
      ? "#ef4444"
      : multiplier >= 3
      ? "#22c55e"
      : multiplier >= 2
      ? "#e8a830"
      : "#ebe1cd";

  const multGlow =
    gameState === "crashed"
      ? "0 0 40px rgba(239,68,68,0.6)"
      : multiplier >= 3
      ? "0 0 40px rgba(34,197,94,0.5)"
      : "0 0 30px rgba(232,168,48,0.4)";

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      {/* Grain overlay */}
      <div className="grain-overlay fixed inset-0 pointer-events-none z-50" />

      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(14,12,8,0.95)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(232,168,48,0.15)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <span style={{ color: "#e8a830" }}>←</span>
            <span className="text-sm font-semibold" style={{ color: "rgba(235,225,205,0.7)" }}>
              Назад
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-base font-black"
              style={{ background: "linear-gradient(135deg, #e8a830, #c47a10)", color: "#0e0c08" }}
            >
              ✈
            </div>
            <span className="text-lg font-black" style={{ color: "#ebe1cd" }}>
              CRASH
            </span>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(232,168,48,0.1)", border: "1px solid rgba(232,168,48,0.25)" }}
          >
            <span className="text-xs" style={{ color: "rgba(235,225,205,0.6)" }}>
              Баланс:
            </span>
            <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
              {balance.toLocaleString("ru")} К
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* ── MESSAGE TOAST ── */}
        {message && (
          <div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all"
            style={{
              background:
                message.type === "win"
                  ? "rgba(34,197,94,0.15)"
                  : message.type === "lose"
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(232,168,48,0.12)",
              border: `1px solid ${
                message.type === "win"
                  ? "rgba(34,197,94,0.4)"
                  : message.type === "lose"
                  ? "rgba(239,68,68,0.4)"
                  : "rgba(232,168,48,0.3)"
              }`,
              color:
                message.type === "win" ? "#22c55e" : message.type === "lose" ? "#ef4444" : "#e8a830",
              backdropFilter: "blur(12px)",
            }}
          >
            {message.text}
          </div>
        )}

        {/* ── GAME CANVAS ── */}
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(145deg, #131108, #0f0e08)",
            border: "1px solid rgba(232,168,48,0.12)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
          }}
        >
          {/* Multiplier display */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
            {gameState === "waiting" ? (
              <div>
                <div className="text-4xl font-black" style={{ color: "#e8a830" }}>
                  {countdown}
                </div>
                <div className="text-xs mt-1 font-medium" style={{ color: "rgba(235,225,205,0.5)" }}>
                  {betPlaced ? "Ставка принята, ждём старта..." : "До старта"}
                </div>
              </div>
            ) : (
              <div>
                <div
                  className="text-5xl font-black transition-all duration-75"
                  style={{ color: multColor, textShadow: multGlow }}
                >
                  ×{multiplier.toFixed(2)}
                </div>
                <div
                  className="text-xs mt-1 font-bold tracking-wider uppercase"
                  style={{
                    color:
                      gameState === "crashed"
                        ? "#ef4444"
                        : cashedOut
                        ? "#22c55e"
                        : "rgba(235,225,205,0.45)",
                  }}
                >
                  {gameState === "crashed"
                    ? "💥 РАЗБИЛСЯ"
                    : cashedOut
                    ? `✓ Забрано на ×${cashOutMultiplier?.toFixed(2)}`
                    : "В ПОЛЁТЕ"}
                </div>
              </div>
            )}
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={900}
            height={320}
            className="w-full"
            style={{ display: "block" }}
          />

          {/* Airplane */}
          {gameState !== "waiting" && (
            <div
              className="absolute pointer-events-none transition-none"
              style={{
                left: `${(planeX / 900) * 100}%`,
                top: `${(planeY / 320) * 100}%`,
                transform: "translate(-50%, -50%)",
                fontSize: "32px",
                filter:
                  gameState === "crashed"
                    ? "drop-shadow(0 0 12px rgba(239,68,68,0.9)) grayscale(0.3)"
                    : "drop-shadow(0 0 14px rgba(232,168,48,0.8))",
                transition: "filter 0.3s",
              }}
            >
              {gameState === "crashed" ? "💥" : "✈️"}
            </div>
          )}

          {/* Axis labels */}
          <div
            className="absolute bottom-2 left-4 text-[10px] font-mono"
            style={{ color: "rgba(235,225,205,0.2)" }}
          >
            ×1.00
          </div>
          <div
            className="absolute bottom-2 right-4 text-[10px] font-mono"
            style={{ color: "rgba(235,225,205,0.2)" }}
          >
            ×9.00+
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(145deg, #181510, #141109)",
            border: "1px solid rgba(232,168,48,0.12)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Bet */}
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-wider uppercase" style={{ color: "rgba(235,225,205,0.45)" }}>
                Ставка
              </label>

              {/* Quick bets */}
              <div className="flex flex-wrap gap-2">
                {BET_OPTIONS.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBet(b);
                      setCustomBet("");
                    }}
                    disabled={gameState !== "waiting" || betPlaced}
                    className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={
                      bet === b && !customBet
                        ? {
                            background: "linear-gradient(135deg, #e8a830, #c47a10)",
                            color: "#0e0c08",
                          }
                        : {
                            background: "rgba(232,168,48,0.08)",
                            color: "#e8a830",
                            border: "1px solid rgba(232,168,48,0.2)",
                          }
                    }
                  >
                    {b.toLocaleString("ru")}
                  </button>
                ))}
              </div>

              {/* Custom bet input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={customBet}
                  onChange={(e) => handleCustomBet(e.target.value)}
                  placeholder="Своя сумма..."
                  disabled={gameState !== "waiting" || betPlaced}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-medium outline-none disabled:opacity-40"
                  style={{
                    background: "rgba(232,168,48,0.06)",
                    border: "1px solid rgba(232,168,48,0.18)",
                    color: "#ebe1cd",
                  }}
                />
                <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
                  К
                </span>
              </div>

              {/* Current bet display */}
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: "rgba(232,168,48,0.05)", border: "1px solid rgba(232,168,48,0.1)" }}
              >
                <span className="text-xs" style={{ color: "rgba(235,225,205,0.5)" }}>
                  Текущая ставка:
                </span>
                <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
                  {bet.toLocaleString("ru")} К
                </span>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="space-y-3 flex flex-col justify-center">
              {/* Auto cashout input */}
              <div>
                <label
                  className="text-xs font-bold tracking-wider uppercase mb-1.5 block"
                  style={{ color: "rgba(235,225,205,0.45)" }}
                >
                  Потенциальный выигрыш
                </label>
                <div
                  className="px-3 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: "rgba(34,197,94,0.07)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    color: "#22c55e",
                  }}
                >
                  {gameState === "flying" && betPlaced && !cashedOut
                    ? `${Math.floor(bet * multiplier).toLocaleString("ru")} К (×${multiplier.toFixed(2)})`
                    : cashOutMultiplier
                    ? `${Math.floor(bet * cashOutMultiplier).toLocaleString("ru")} К забрано`
                    : `~${Math.floor(bet * 2).toLocaleString("ru")} К при ×2.00`}
                </div>
              </div>

              {/* Place Bet / Cash Out button */}
              {gameState === "waiting" ? (
                <button
                  onClick={handlePlaceBet}
                  disabled={betPlaced || bet > balance}
                  className="w-full py-3.5 rounded-xl font-black text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  style={
                    betPlaced
                      ? {
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.4)",
                          color: "#22c55e",
                        }
                      : {
                          background: "linear-gradient(135deg, #e8a830, #c47a10)",
                          color: "#0e0c08",
                          boxShadow: "0 4px 24px rgba(232,168,48,0.3)",
                        }
                  }
                >
                  {betPlaced ? "✓ Ставка принята" : "Поставить ставку"}
                </button>
              ) : gameState === "flying" ? (
                <button
                  onClick={handleCashOut}
                  disabled={!betPlaced || cashedOut}
                  className="w-full py-3.5 rounded-xl font-black text-base transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  style={
                    cashedOut
                      ? {
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.35)",
                          color: "#22c55e",
                        }
                      : !betPlaced
                      ? {
                          background: "rgba(232,168,48,0.08)",
                          border: "1px solid rgba(232,168,48,0.2)",
                          color: "rgba(232,168,48,0.4)",
                        }
                      : {
                          background: "linear-gradient(135deg, #22c55e, #16a34a)",
                          color: "#fff",
                          boxShadow: "0 4px 24px rgba(34,197,94,0.4)",
                          animation: "pulse 1s infinite",
                        }
                  }
                >
                  {cashedOut
                    ? `✓ Забрано ×${cashOutMultiplier?.toFixed(2)}`
                    : !betPlaced
                    ? "Нет активной ставки"
                    : `🚀 Забрать × ${multiplier.toFixed(2)}`}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 rounded-xl font-black text-base opacity-50 cursor-not-allowed"
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    color: "#ef4444",
                  }}
                >
                  💥 Разбился — ожидание
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── HISTORY ── */}
        {history.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: "linear-gradient(145deg, #181510, #141109)",
              border: "1px solid rgba(232,168,48,0.08)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.1)" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(235,225,205,0.4)" }}>
                История раундов
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.1)" }} />
            </div>

            <div className="flex flex-wrap gap-2">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-black"
                  style={
                    item.win != null
                      ? {
                          background: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(34,197,94,0.3)",
                          color: "#22c55e",
                        }
                      : item.multiplier <= 1.5
                      ? {
                          background: "rgba(239,68,68,0.12)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#ef4444",
                        }
                      : item.multiplier <= 3
                      ? {
                          background: "rgba(232,168,48,0.1)",
                          border: "1px solid rgba(232,168,48,0.25)",
                          color: "#e8a830",
                        }
                      : {
                          background: "rgba(168,85,247,0.1)",
                          border: "1px solid rgba(168,85,247,0.3)",
                          color: "#a855f7",
                        }
                  }
                >
                  ×{item.multiplier.toFixed(2)}
                  {item.win != null && <span className="ml-1 opacity-70">+{item.win.toLocaleString("ru")}К</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INFO PANEL ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Мин. ставка", value: "50 К" },
            { label: "Макс. выигрыш", value: "×100+" },
            { label: "Возврат", value: "95%" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(232,168,48,0.04)",
                border: "1px solid rgba(232,168,48,0.08)",
              }}
            >
              <div className="text-xs mb-1" style={{ color: "rgba(235,225,205,0.4)" }}>
                {stat.label}
              </div>
              <div className="text-sm font-bold" style={{ color: "#e8a830" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer
        className="mt-12 border-t py-6"
        style={{ borderColor: "rgba(232,168,48,0.1)", background: "rgba(10,9,7,0.8)" }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs" style={{ color: "rgba(235,225,205,0.2)" }}>
            Игра на деньги — только для лиц старше 18 лет. Играйте ответственно.
          </p>
        </div>
      </footer>
    </div>
  );
}