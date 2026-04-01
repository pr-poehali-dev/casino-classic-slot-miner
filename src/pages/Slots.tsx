import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "🔔", "⭐"];

const PAYOUTS: Record<string, number> = {
  "💎💎💎": 50,
  "7️⃣7️⃣7️⃣": 30,
  "🔔🔔🔔": 15,
  "⭐⭐⭐": 12,
  "🍇🍇🍇": 10,
  "🍊🍊🍊": 8,
  "🍋🍋🍋": 6,
  "🍒🍒🍒": 5,
  "🍒🍒_": 2,
};

function getRandomSymbol() {
  // Weighted: diamonds and 7s rarer
  const weights = [12, 12, 10, 8, 2, 3, 7, 8];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= weights[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[0];
}

function checkWin(reels: string[], bet: number): { multiplier: number; label: string } {
  const key = reels.join("");
  if (PAYOUTS[key]) return { multiplier: PAYOUTS[key], label: key };

  // Two cherries anywhere
  const cherryCount = reels.filter((s) => s === "🍒").length;
  if (cherryCount >= 2) return { multiplier: 2, label: "🍒🍒" };

  return { multiplier: 0, label: "" };
}

const REEL_ITEMS = 20; // items per reel strip

function buildReelStrip() {
  return Array.from({ length: REEL_ITEMS }, () => getRandomSymbol());
}

export default function Slots() {
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(100);
  const [reels, setReels] = useState(["🍒", "🍋", "🍊"]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ win: number; label: string } | null>(null);
  const [history, setHistory] = useState<Array<{ reels: string[]; win: number }>>([]);
  const [animReels, setAnimReels] = useState([false, false, false]);

  const spinTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const spin = useCallback(() => {
    if (spinning || balance < bet) return;
    setBalance((b) => b - bet);
    setResult(null);
    setSpinning(true);

    const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    setAnimReels([true, true, true]);

    // Stop reels one by one
    spinTimeouts.current.forEach(clearTimeout);
    spinTimeouts.current = [];

    [0, 1, 2].forEach((i) => {
      const t = setTimeout(
        () => {
          setAnimReels((prev) => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
          setReels((prev) => {
            const next = [...prev];
            next[i] = finalReels[i];
            return next;
          });

          if (i === 2) {
            // All stopped
            const { multiplier, label } = checkWin(finalReels, bet);
            const win = multiplier * bet;
            setBalance((b) => b + win);
            setResult({ win, label });
            setHistory((h) => [{ reels: finalReels, win }, ...h.slice(0, 9)]);
            setSpinning(false);
          }
        },
        600 + i * 500
      );
      spinTimeouts.current.push(t);
    });
  }, [spinning, balance, bet]);

  const betOptions = [50, 100, 250, 500, 1000];

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
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-xl" style={{ color: "rgba(235,225,205,0.5)" }}>←</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black" style={{ color: "#ebe1cd" }}>KAZAH</span>
              <span className="text-lg font-black" style={{ color: "#e8a830" }}> CASINO</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: "rgba(232,168,48,0.1)",
                border: "1px solid rgba(232,168,48,0.25)",
              }}
            >
              <span className="text-sm" style={{ color: "rgba(235,225,205,0.6)" }}>Баланс:</span>
              <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
                {balance.toLocaleString("ru")} К
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-1" style={{ color: "#ebe1cd" }}>
            🎰 Слоты
          </h1>
          <p className="text-sm" style={{ color: "rgba(235,225,205,0.4)" }}>
            Три одинаковых символа — выигрыш!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slot Machine */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: "1px solid rgba(232,168,48,0.2)",
                boxShadow: "0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(232,168,48,0.1)",
              }}
            >
              {/* Machine top decoration */}
              <div
                className="px-6 py-3 flex items-center justify-center"
                style={{ background: "linear-gradient(90deg, rgba(232,168,48,0.05), rgba(232,168,48,0.12), rgba(232,168,48,0.05))" }}
              >
                <div className="flex gap-2">
                  {["#e8a830", "#c47a10", "#e8a830"].map((c, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ background: c, boxShadow: `0 0 8px ${c}88` }}
                    />
                  ))}
                </div>
                <span
                  className="mx-4 text-xs font-bold tracking-[0.3em] uppercase"
                  style={{ color: "rgba(232,168,48,0.7)" }}
                >
                  Lucky Slots
                </span>
                <div className="flex gap-2">
                  {["#e8a830", "#c47a10", "#e8a830"].map((c, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ background: c, boxShadow: `0 0 8px ${c}88` }}
                    />
                  ))}
                </div>
              </div>

              {/* Reels */}
              <div className="px-8 py-6">
                <div
                  className="flex gap-4 justify-center mb-6 p-4 rounded-xl"
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    border: "2px solid rgba(232,168,48,0.15)",
                    boxShadow: "inset 0 4px 24px rgba(0,0,0,0.5)",
                  }}
                >
                  {reels.map((sym, i) => (
                    <div
                      key={i}
                      className="flex-1 h-32 flex items-center justify-center rounded-lg relative overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, #0a0807, #111009, #0a0807)",
                        border: "1px solid rgba(232,168,48,0.12)",
                      }}
                    >
                      {/* Spin animation overlay */}
                      {animReels[i] && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 animate-spin-reel">
                          {buildReelStrip().map((s, j) => (
                            <span key={j} className="text-3xl leading-none">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Static symbol */}
                      {!animReels[i] && (
                        <span
                          className="text-5xl transition-all duration-200 select-none"
                          style={{
                            filter: result?.win && result.win > 0
                              ? "drop-shadow(0 0 16px rgba(232,168,48,0.8))"
                              : "none",
                            transform: spinning ? "scale(0.9)" : "scale(1)",
                          }}
                        >
                          {sym}
                        </span>
                      )}

                      {/* Reel scan line effect */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Win line indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-0.5" style={{ background: "rgba(232,168,48,0.2)" }} />
                  <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "rgba(232,168,48,0.5)" }}>
                    Линия выигрыша
                  </span>
                  <div className="flex-1 h-0.5" style={{ background: "rgba(232,168,48,0.2)" }} />
                </div>

                {/* Result */}
                <div
                  className="h-14 flex items-center justify-center rounded-xl mb-6"
                  style={{
                    background: result
                      ? result.win > 0
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(239,68,68,0.08)"
                      : "rgba(0,0,0,0.3)",
                    border: `1px solid ${
                      result
                        ? result.win > 0
                          ? "rgba(34,197,94,0.3)"
                          : "rgba(239,68,68,0.2)"
                        : "rgba(232,168,48,0.08)"
                    }`,
                    transition: "all 0.3s",
                  }}
                >
                  {!result && (
                    <span className="text-sm font-medium" style={{ color: "rgba(235,225,205,0.3)" }}>
                      Нажмите SPIN
                    </span>
                  )}
                  {result && result.win > 0 && (
                    <div className="text-center">
                      <span className="text-xl font-black" style={{ color: "#22c55e" }}>
                        🎉 +{result.win.toLocaleString("ru")} К
                      </span>
                    </div>
                  )}
                  {result && result.win === 0 && (
                    <span className="text-sm font-medium" style={{ color: "rgba(239,68,68,0.7)" }}>
                      Не повезло... Попробуй снова!
                    </span>
                  )}
                </div>

                {/* Bet selector */}
                <div className="flex gap-2 mb-4 flex-wrap justify-center">
                  {betOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => !spinning && setBet(b)}
                      disabled={spinning}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-150 hover:scale-105 disabled:opacity-50"
                      style={{
                        background: bet === b ? "linear-gradient(135deg, #e8a830, #c47a10)" : "rgba(232,168,48,0.08)",
                        color: bet === b ? "#0e0c08" : "rgba(235,225,205,0.6)",
                        border: `1px solid ${bet === b ? "#e8a830" : "rgba(232,168,48,0.15)"}`,
                      }}
                    >
                      {b.toLocaleString("ru")} К
                    </button>
                  ))}
                </div>

                {/* Spin button */}
                <button
                  onClick={spin}
                  disabled={spinning || balance < bet}
                  className="w-full py-4 rounded-xl text-xl font-black tracking-widest uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: spinning
                      ? "rgba(232,168,48,0.3)"
                      : "linear-gradient(135deg, #e8a830 0%, #c47a10 50%, #e8a830 100%)",
                    backgroundSize: "200% 100%",
                    color: "#0e0c08",
                    boxShadow: spinning ? "none" : "0 4px 24px rgba(232,168,48,0.3)",
                  }}
                >
                  {spinning ? "⠿ КРУТИМ..." : "▶ SPIN"}
                </button>

                <p className="text-center text-xs mt-3" style={{ color: "rgba(235,225,205,0.25)" }}>
                  Ставка: {bet.toLocaleString("ru")} К · Баланс: {balance.toLocaleString("ru")} К
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Paytable */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: "1px solid rgba(232,168,48,0.12)",
              }}
            >
              <h3
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "rgba(232,168,48,0.7)" }}
              >
                Таблица выплат
              </h3>
              <div className="space-y-2">
                {[
                  { combo: "💎💎💎", mult: "×50" },
                  { combo: "7️⃣7️⃣7️⃣", mult: "×30" },
                  { combo: "🔔🔔🔔", mult: "×15" },
                  { combo: "⭐⭐⭐", mult: "×12" },
                  { combo: "🍇🍇🍇", mult: "×10" },
                  { combo: "🍊🍊🍊", mult: "×8" },
                  { combo: "🍋🍋🍋", mult: "×6" },
                  { combo: "🍒🍒🍒", mult: "×5" },
                  { combo: "🍒🍒 ?", mult: "×2" },
                ].map((row) => (
                  <div key={row.combo} className="flex items-center justify-between">
                    <span className="text-sm">{row.combo}</span>
                    <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
                      {row.mult}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div
              className="rounded-2xl p-5 flex-1"
              style={{
                background: "linear-gradient(160deg, #1c1710, #141109)",
                border: "1px solid rgba(232,168,48,0.12)",
              }}
            >
              <h3
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "rgba(232,168,48,0.7)" }}
              >
                История
              </h3>
              {history.length === 0 && (
                <p className="text-xs" style={{ color: "rgba(235,225,205,0.25)" }}>
                  Пока пусто...
                </p>
              )}
              <div className="space-y-2">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg"
                    style={{
                      background: h.win > 0 ? "rgba(34,197,94,0.06)" : "rgba(0,0,0,0.2)",
                      border: `1px solid ${h.win > 0 ? "rgba(34,197,94,0.15)" : "rgba(232,168,48,0.06)"}`,
                    }}
                  >
                    <span className="text-sm">{h.reels.join("")}</span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: h.win > 0 ? "#22c55e" : "rgba(239,68,68,0.6)" }}
                    >
                      {h.win > 0 ? `+${h.win}` : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}