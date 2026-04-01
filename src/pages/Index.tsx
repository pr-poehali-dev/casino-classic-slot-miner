import { useState } from "react";
import { Link } from "react-router-dom";

const games = [
  {
    id: "slots",
    title: "Слоты",
    description: "Классические игровые автоматы с барабанами. Крутите и выигрывайте!",
    emoji: "🎰",
    tag: "ГОРЯЧЕЕ",
    tagColor: "#e8a830",
    href: "/slots",
  },
  {
    id: "miner",
    title: "Минёр",
    description: "Найдите бриллианты, избегайте мин. Чем дальше — тем больше выигрыш!",
    emoji: "💎",
    tag: "ПОПУЛЯРНОЕ",
    tagColor: "#22c55e",
    href: "/miner",
  },
];

export default function Index() {
  const [balance] = useState(10000);

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      {/* ── GRAIN OVERLAY ── */}
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
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded flex items-center justify-center text-lg font-black"
              style={{ background: "linear-gradient(135deg, #e8a830, #c47a10)", color: "#0e0c08" }}
            >
              ♠
            </div>
            <div>
              <span className="text-xl font-black tracking-tight" style={{ color: "#ebe1cd" }}>
                ROYAL
              </span>
              <span className="text-xl font-black tracking-tight" style={{ color: "#e8a830" }}>
                BET
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {["Главная", "Игры", "Бонусы"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium transition-colors"
                style={{ color: "rgba(235,225,205,0.55)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ebe1cd")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(235,225,205,0.55)")}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Balance */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              background: "rgba(232,168,48,0.1)",
              border: "1px solid rgba(232,168,48,0.25)",
            }}
          >
            <span className="text-sm" style={{ color: "rgba(235,225,205,0.6)" }}>
              Баланс:
            </span>
            <span className="text-sm font-bold" style={{ color: "#e8a830" }}>
              {balance.toLocaleString("ru")} ₽
            </span>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-16 md:py-24">
        {/* bg glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(232,168,48,0.07) 0%, transparent 70%)",
          }}
        />
        {/* decorative cards */}
        <div className="absolute top-8 left-8 text-5xl opacity-5 select-none">♦</div>
        <div className="absolute top-16 right-12 text-6xl opacity-5 select-none">♣</div>
        <div className="absolute bottom-8 left-16 text-4xl opacity-5 select-none">♥</div>
        <div className="absolute bottom-12 right-8 text-5xl opacity-5 select-none">♠</div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 tracking-widest uppercase"
            style={{
              background: "rgba(232,168,48,0.12)",
              border: "1px solid rgba(232,168,48,0.3)",
              color: "#e8a830",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#e8a830" }} />
            Онлайн казино
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight" style={{ color: "#ebe1cd" }}>
            Испытай{" "}
            <span
              className="font-cormorant italic font-light"
              style={{ color: "#e8a830" }}
            >
              удачу
            </span>{" "}
            сегодня
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(235,225,205,0.5)" }}>
            Слоты, минёр и другие азартные игры. Честные выплаты, мгновенный вывод.
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 md:gap-16 mb-10">
            {[
              { val: "10 000", label: "Стартовый бонус" },
              { val: "97%", label: "RTP" },
              { val: "24/7", label: "Поддержка" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl md:text-3xl font-black" style={{ color: "#e8a830" }}>
                  {s.val}
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(235,225,205,0.45)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GAMES ── */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.15)" }} />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(235,225,205,0.5)" }}>
            Игры
          </h2>
          <div className="flex-1 h-px" style={{ background: "rgba(232,168,48,0.15)" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.href}
              className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "linear-gradient(145deg, #181510, #141109)",
                border: "1px solid rgba(232,168,48,0.12)",
                boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(232,168,48,0.35)";
                e.currentTarget.style.boxShadow = "0 8px 48px rgba(232,168,48,0.08), 0 4px 32px rgba(0,0,0,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(232,168,48,0.12)";
                e.currentTarget.style.boxShadow = "0 4px 32px rgba(0,0,0,0.4)";
              }}
            >
              {/* Card top */}
              <div
                className="relative h-40 flex items-center justify-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(232,168,48,0.04), rgba(232,168,48,0.01))" }}
              >
                <div className="text-8xl select-none" style={{ filter: "drop-shadow(0 0 24px rgba(232,168,48,0.3))" }}>
                  {game.emoji}
                </div>
                {/* Tag */}
                <div
                  className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest"
                  style={{ background: `${game.tagColor}22`, color: game.tagColor, border: `1px solid ${game.tagColor}44` }}
                >
                  {game.tag}
                </div>
                {/* Corner suit decorations */}
                <div className="absolute top-3 left-3 text-2xl opacity-10 select-none" style={{ color: "#e8a830" }}>
                  {game.id === "slots" ? "♠" : "♦"}
                </div>
              </div>

              {/* Card body */}
              <div className="p-5">
                <h3 className="text-xl font-black mb-1" style={{ color: "#ebe1cd" }}>
                  {game.title}
                </h3>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(235,225,205,0.45)" }}>
                  {game.description}
                </p>

                <div
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 group-hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #e8a830, #c47a10)",
                    color: "#0e0c08",
                  }}
                >
                  Играть
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
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
