import { useState } from "react";
import { Link } from "react-router-dom";

const VALID_PROMO_CODES: Record<string, { coins: number; label: string }> = {
  ROYAL100: { coins: 100, label: "+100 монет" },
  LUCKY500: { coins: 500, label: "+500 монет" },
  VIP1000: { coins: 1000, label: "+1000 монет" },
  WELCOME50: { coins: 50, label: "+50 монет" },
};

const dailyBonuses = [
  { day: 1, coins: 50, claimed: true },
  { day: 2, coins: 100, claimed: true },
  { day: 3, coins: 150, claimed: false, active: true },
  { day: 4, coins: 200, claimed: false },
  { day: 5, coins: 300, claimed: false },
  { day: 6, coins: 500, claimed: false },
  { day: 7, coins: 1000, claimed: false },
];

export default function Bonuses() {
  const [coins, setCoins] = useState(250);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "success" | "error">("idle");
  const [promoMessage, setPromoMessage] = useState("");
  const [usedCodes, setUsedCodes] = useState<string[]>([]);
  const [dailyDays, setDailyDays] = useState(dailyBonuses);
  const [claimedToday, setClaimedToday] = useState(false);

  const handlePromoSubmit = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (usedCodes.includes(code)) {
      setPromoStatus("error");
      setPromoMessage("Этот промокод уже был использован");
      return;
    }

    const promo = VALID_PROMO_CODES[code];
    if (promo) {
      setCoins((prev) => prev + promo.coins);
      setUsedCodes((prev) => [...prev, code]);
      setPromoStatus("success");
      setPromoMessage(`Промокод активирован! Вы получили ${promo.label}`);
      setPromoCode("");
    } else {
      setPromoStatus("error");
      setPromoMessage("Недействительный промокод");
    }

    setTimeout(() => {
      setPromoStatus("idle");
      setPromoMessage("");
    }, 3500);
  };

  const handleDailyClaim = () => {
    if (claimedToday) return;
    const activeDay = dailyDays.find((d) => d.active);
    if (!activeDay) return;

    setCoins((prev) => prev + activeDay.coins);
    setDailyDays((prev) =>
      prev.map((d) =>
        d.active ? { ...d, claimed: true, active: false } : d
      )
    );
    setClaimedToday(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      {/* GRAIN OVERLAY */}
      <div className="grain-overlay fixed inset-0 pointer-events-none z-50" />

      {/* HEADER */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(14,12,8,0.95)",
          backdropFilter: "blur(20px)",
          borderColor: "rgba(232,168,48,0.15)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Back */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: "rgba(235,225,205,0.5)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ebe1cd")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(235,225,205,0.5)")}
            >
              ← Назад
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded flex items-center justify-center text-lg font-black"
                style={{ background: "linear-gradient(135deg, #e8a830, #c47a10)", color: "#0e0c08" }}
              >
                ♠
              </div>
              <div>
                <span className="text-xl font-black tracking-tight" style={{ color: "#ebe1cd" }}>ROYAL</span>
                <span className="text-xl font-black tracking-tight" style={{ color: "#e8a830" }}>BET</span>
              </div>
            </div>
          </div>

          {/* Coin Balance */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              background: "rgba(232,168,48,0.1)",
              border: "1px solid rgba(232,168,48,0.25)",
            }}
          >
            <span className="text-base">🪙</span>
            <span className="text-sm" style={{ color: "rgba(235,225,205,0.6)" }}>Монеты:</span>
            <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
              {coins.toLocaleString("ru")}
            </span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative py-12 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(232,168,48,0.07) 0%, transparent 70%)" }}
        />
        <div className="absolute top-6 left-8 text-5xl opacity-5 select-none">🎁</div>
        <div className="absolute bottom-6 right-10 text-4xl opacity-5 select-none">🪙</div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ background: "rgba(232,168,48,0.1)", border: "1px solid rgba(232,168,48,0.2)", color: "#e8a830" }}>
            🎁 Бонусный центр
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ color: "#ebe1cd" }}>
            Бонусы & Награды
          </h1>
          <p className="text-base" style={{ color: "rgba(235,225,205,0.45)" }}>
            Получайте монеты каждый день и активируйте промокоды
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-4 pb-20 space-y-10">

        {/* ── COIN BALANCE CARD ── */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
          style={{
            background: "linear-gradient(135deg, rgba(232,168,48,0.12), rgba(196,122,16,0.06))",
            border: "1px solid rgba(232,168,48,0.3)",
            boxShadow: "0 0 40px rgba(232,168,48,0.06)",
          }}
        >
          <div className="text-7xl" style={{ filter: "drop-shadow(0 0 20px rgba(232,168,48,0.5))" }}>🪙</div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm font-medium uppercase tracking-widest mb-1" style={{ color: "rgba(235,225,205,0.5)" }}>
              Ваш баланс монет
            </p>
            <p className="text-5xl font-black" style={{ color: "#e8a830" }}>
              {coins.toLocaleString("ru")}
            </p>
            <p className="text-sm mt-1" style={{ color: "rgba(235,225,205,0.35)" }}>
              Монеты можно тратить на внутриигровые бонусы
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm" style={{ color: "rgba(235,225,205,0.4)" }}>
            <div className="flex items-center gap-2">
              <span style={{ color: "#22c55e" }}>✓</span> Ежедневный вход
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: "#22c55e" }}>✓</span> Промокоды
            </div>
            <div className="flex items-center gap-2">
              <span style={{ color: "rgba(235,225,205,0.3)" }}>○</span> Задания (скоро)
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.12)" }} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(235,225,205,0.35)" }}>
            Ежедневный бонус
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.12)" }} />
        </div>

        {/* ── DAILY BONUS ── */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(145deg, #181510, #141109)",
            border: "1px solid rgba(232,168,48,0.12)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black" style={{ color: "#ebe1cd" }}>Ежедневный вход</h2>
              <p className="text-sm mt-0.5" style={{ color: "rgba(235,225,205,0.4)" }}>
                Заходите каждый день, чтобы получить больше монет
              </p>
            </div>
            <div
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              День 3 из 7
            </div>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dailyDays.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center gap-1 rounded-xl py-3 px-1 transition-all duration-200"
                style={{
                  background: d.claimed
                    ? "rgba(34,197,94,0.08)"
                    : d.active
                    ? "rgba(232,168,48,0.12)"
                    : "rgba(255,255,255,0.03)",
                  border: d.claimed
                    ? "1px solid rgba(34,197,94,0.25)"
                    : d.active
                    ? "1px solid rgba(232,168,48,0.4)"
                    : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="text-[10px] font-bold" style={{ color: "rgba(235,225,205,0.4)" }}>
                  Д{d.day}
                </span>
                <span className="text-lg">
                  {d.claimed ? "✅" : d.active ? "🎁" : "🔒"}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{
                    color: d.claimed ? "#22c55e" : d.active ? "#e8a830" : "rgba(235,225,205,0.25)",
                  }}
                >
                  {d.coins}🪙
                </span>
              </div>
            ))}
          </div>

          {/* Claim button */}
          <button
            onClick={handleDailyClaim}
            disabled={claimedToday || !dailyDays.some((d) => d.active)}
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200"
            style={
              claimedToday
                ? {
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(235,225,205,0.3)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    cursor: "not-allowed",
                  }
                : {
                    background: "linear-gradient(135deg, #e8a830, #c47a10)",
                    color: "#0e0c08",
                    boxShadow: "0 4px 20px rgba(232,168,48,0.3)",
                    cursor: "pointer",
                  }
            }
          >
            {claimedToday ? "✅ Получено сегодня" : "🎁 Получить ежедневный бонус — 150 🪙"}
          </button>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.12)" }} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(235,225,205,0.35)" }}>
            Промокод
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.12)" }} />
        </div>

        {/* ── PROMO CODE ── */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(145deg, #181510, #141109)",
            border: "1px solid rgba(232,168,48,0.12)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="mb-6">
            <h2 className="text-xl font-black" style={{ color: "#ebe1cd" }}>Ввести промокод</h2>
            <p className="text-sm mt-0.5" style={{ color: "rgba(235,225,205,0.4)" }}>
              Введите действующий промокод и получите бонусные монеты
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  if (promoStatus !== "idle") setPromoStatus("idle");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePromoSubmit()}
                placeholder="Введите промокод..."
                maxLength={20}
                className="w-full px-4 py-3.5 rounded-xl text-sm font-mono font-bold outline-none transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: promoStatus === "error"
                    ? "1px solid rgba(239,68,68,0.5)"
                    : promoStatus === "success"
                    ? "1px solid rgba(34,197,94,0.5)"
                    : "1px solid rgba(232,168,48,0.2)",
                  color: "#ebe1cd",
                  letterSpacing: "0.1em",
                }}
                onFocus={(e) => {
                  if (promoStatus === "idle")
                    e.currentTarget.style.border = "1px solid rgba(232,168,48,0.5)";
                }}
                onBlur={(e) => {
                  if (promoStatus === "idle")
                    e.currentTarget.style.border = "1px solid rgba(232,168,48,0.2)";
                }}
              />
              {/* Icon inside input */}
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none"
              >
                {promoStatus === "success" ? "✅" : promoStatus === "error" ? "❌" : "🏷️"}
              </span>
            </div>

            <button
              onClick={handlePromoSubmit}
              disabled={!promoCode.trim()}
              className="px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap"
              style={
                promoCode.trim()
                  ? {
                      background: "linear-gradient(135deg, #e8a830, #c47a10)",
                      color: "#0e0c08",
                      boxShadow: "0 4px 16px rgba(232,168,48,0.25)",
                      cursor: "pointer",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(235,225,205,0.25)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "not-allowed",
                    }
              }
            >
              Активировать
            </button>
          </div>

          {/* Status message */}
          {promoMessage && (
            <div
              className="mt-3 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300"
              style={{
                background: promoStatus === "success"
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(239,68,68,0.08)",
                border: promoStatus === "success"
                  ? "1px solid rgba(34,197,94,0.25)"
                  : "1px solid rgba(239,68,68,0.25)",
                color: promoStatus === "success" ? "#22c55e" : "#ef4444",
              }}
            >
              {promoMessage}
            </div>
          )}

          {/* Hint */}
          <p className="mt-4 text-xs" style={{ color: "rgba(235,225,205,0.25)" }}>
            💡 Попробуйте: WELCOME50 · ROYAL100 · LUCKY500 · VIP1000
          </p>
        </div>

        {/* ── COMING SOON ── */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.12)" }} />
          <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(235,225,205,0.35)" }}>
            Скоро
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.12)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "🏆", title: "Задания", desc: "Выполняйте задания и зарабатывайте монеты", badge: "Скоро" },
            { icon: "👥", title: "Реферальная программа", desc: "Приглашайте друзей и получайте % с их монет", badge: "Скоро" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5 flex gap-4 items-start opacity-50"
              style={{
                background: "linear-gradient(145deg, #181510, #141109)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div className="text-4xl">{item.icon}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black" style={{ color: "#ebe1cd" }}>{item.title}</h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(232,168,48,0.1)", color: "#e8a830", border: "1px solid rgba(232,168,48,0.2)" }}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "rgba(235,225,205,0.4)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        className="border-t py-8"
        style={{ borderColor: "rgba(232,168,48,0.1)", background: "rgba(10,9,7,0.8)" }}
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: "#ebe1cd" }}>ROYAL</span>
            <span className="text-lg font-black" style={{ color: "#e8a830" }}>BET</span>
          </div>
          <p className="text-xs text-center" style={{ color: "rgba(235,225,205,0.25)" }}>
            Игра на деньги — только для лиц старше 18 лет. Играйте ответственно.
          </p>
          <p className="text-xs" style={{ color: "rgba(235,225,205,0.2)" }}>
            © 2024 RoyalBet
          </p>
        </div>
      </footer>
    </div>
  );
}
