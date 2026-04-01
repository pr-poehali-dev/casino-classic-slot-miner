import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const services = [
  {
    icon: "Layers",
    title: "Веб-разработка",
    desc: "Создаём сайты и веб-приложения, которые работают безупречно на любом устройстве и удерживают пользователя.",
  },
  {
    icon: "Sparkles",
    title: "Дизайн интерфейсов",
    desc: "Продумываем каждый пиксель. Дизайн не просто красивый — он решает задачи бизнеса.",
  },
  {
    icon: "Zap",
    title: "Быстрый запуск",
    desc: "MVP за 2–4 недели. Тестируем гипотезы быстро, без лишних расходов и затяжных согласований.",
  },
  {
    icon: "TrendingUp",
    title: "Рост и аналитика",
    desc: "Встраиваем метрики с первого дня. Знаем, что работает, и масштабируем именно это.",
  },
];

const works = [
  { num: "01", name: "Финтех-платформа", tag: "Продукт", year: "2024" },
  { num: "02", name: "E-commerce редизайн", tag: "Дизайн", year: "2024" },
  { num: "03", name: "SaaS для логистики", tag: "Разработка", year: "2023" },
  { num: "04", name: "Корпоративный портал", tag: "Платформа", year: "2023" },
];

const stats = [
  { val: "87", unit: "+", label: "Проектов запущено" },
  { val: "6", unit: "лет", label: "На рынке" },
  { val: "98", unit: "%", label: "Клиентов возвращаются" },
  { val: "14", unit: "дн", label: "Среднее время запуска" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export default function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const heroSection = useInView(0.1);
  const statsSection = useInView(0.1);
  const servicesSection = useInView(0.1);
  const worksSection = useInView(0.1);
  const ctaSection = useInView(0.1);

  return (
    <div className="grain-overlay min-h-screen font-golos" style={{ background: "var(--surface)" }}>

      {/* ─── NAV ─── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(14, 12, 8, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(232,168,48,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center"
              style={{ background: "var(--gold)" }}
            >
              <span className="text-xs font-black" style={{ color: "#0e0c08" }}>С</span>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "#EBE1CD" }}>
              Студия
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {["Услуги", "Работы", "О нас", "Контакт"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "var(--text-dim)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#EBE1CD")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
              >
                {item}
              </a>
            ))}
          </div>

          <a
            href="#contact"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: "var(--gold)",
              color: "#0e0c08",
            }}
          >
            Обсудить проект
            <Icon name="ArrowRight" size={14} />
          </a>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "#EBE1CD" }}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {menuOpen && (
          <div
            className="md:hidden px-6 py-4 flex flex-col gap-4"
            style={{ background: "rgba(14,12,8,0.97)", borderTop: "1px solid rgba(232,168,48,0.1)" }}
          >
            {["Услуги", "Работы", "О нас", "Контакт"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-base font-medium py-1"
                style={{ color: "#EBE1CD" }}
                onClick={() => setMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section
        ref={heroSection.ref}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20"
      >
        {/* Background geometric */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.04] pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03] pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)",
            transform: "translate(-30%, 30%)",
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(232,168,48,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(232,168,48,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div
            className={`transition-all duration-1000 ${heroSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
              style={{
                background: "var(--gold-dim)",
                border: "1px solid rgba(232,168,48,0.2)",
                color: "var(--gold)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--gold)" }} />
              Принимаем новые проекты
            </div>
          </div>

          <h1
            className={`text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-6 transition-all duration-1000 delay-100 ${heroSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ color: "#EBE1CD" }}
          >
            Создаём
            <br />
            <span
              className="font-cormorant italic font-light"
              style={{ color: "var(--gold)" }}
            >
              продукты,
            </span>
            <br />
            которые живут
          </h1>

          <p
            className={`text-lg md:text-xl max-w-xl mb-10 leading-relaxed transition-all duration-1000 delay-200 ${heroSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ color: "var(--text-dim)" }}
          >
            Мы — команда дизайнеров и разработчиков. Превращаем идеи в цифровые продукты, которые решают реальные задачи.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-300 ${heroSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <button
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm font-bold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                background: "var(--gold)",
                color: "#0e0c08",
                boxShadow: "0 0 30px rgba(232,168,48,0.15)",
              }}
            >
              Начать проект
              <Icon name="ArrowRight" size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                border: "1px solid rgba(235, 225, 205, 0.12)",
                color: "#EBE1CD",
                background: "rgba(235,225,205,0.03)",
              }}
            >
              <Icon name="Play" size={14} />
              Смотреть работы
            </button>
          </div>

          {/* Scroll hint */}
          <div
            className={`mt-20 flex items-center gap-3 transition-all duration-1000 delay-500 ${heroSection.inView ? "opacity-100" : "opacity-0"}`}
            style={{ color: "var(--text-dim)" }}
          >
            <div
              className="w-px h-12"
              style={{
                background: "linear-gradient(to bottom, transparent, var(--gold))",
              }}
            />
            <span className="text-xs tracking-widest uppercase">Скролл</span>
          </div>
        </div>

        {/* Floating badge */}
        <div
          className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <div
            className="w-32 h-32 rounded-full flex flex-col items-center justify-center text-center"
            style={{
              border: "1px solid rgba(232,168,48,0.2)",
              background: "rgba(232,168,48,0.05)",
            }}
          >
            <span className="text-3xl font-black" style={{ color: "var(--gold)" }}>87+</span>
            <span className="text-xs mt-1 leading-tight" style={{ color: "var(--text-dim)" }}>проектов<br />запущено</span>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section ref={statsSection.ref} className="py-16 relative">
        <div
          className="absolute inset-0"
          style={{ borderTop: "1px solid rgba(232,168,48,0.08)", borderBottom: "1px solid rgba(232,168,48,0.08)" }}
        />
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center transition-all duration-700 ${statsSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl md:text-5xl font-black" style={{ color: "var(--gold)" }}>
                    {s.val}
                  </span>
                  <span className="text-lg font-semibold" style={{ color: "var(--gold)" }}>{s.unit}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section ref={servicesSection.ref} className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`mb-14 transition-all duration-700 ${servicesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
              Что мы делаем
            </p>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <h2
                className="text-4xl md:text-5xl font-black leading-tight"
                style={{ color: "#EBE1CD" }}
              >
                Услуги,<br />
                <span className="font-cormorant italic font-light">которые работают</span>
              </h2>
              <a
                href="#"
                className="text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: "var(--gold)" }}
              >
                Все услуги <Icon name="ArrowRight" size={14} />
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {services.map((s, i) => (
              <div
                key={s.title}
                className={`group p-7 rounded-lg hover-lift cursor-pointer transition-all duration-700 ${servicesSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid rgba(232,168,48,0.06)",
                  transitionDelay: `${i * 80}ms`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,168,48,0.2)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,168,48,0.06)";
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "var(--gold-dim)" }}
                >
                  <Icon name={s.icon} fallback="Star" size={18} style={{ color: "var(--gold)" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#EBE1CD" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  {s.desc}
                </p>
                <div
                  className="mt-5 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "var(--gold)" }}
                >
                  Подробнее <Icon name="ArrowRight" size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKS ─── */}
      <section ref={worksSection.ref} className="py-24 relative">
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, var(--gold) 0px, var(--gold) 1px, transparent 1px, transparent 60px)",
          }}
        />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div
            className={`mb-14 transition-all duration-700 ${worksSection.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          >
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
              Наши работы
            </p>
            <h2 className="text-4xl md:text-5xl font-black" style={{ color: "#EBE1CD" }}>
              Избранные<br />
              <span className="font-cormorant italic font-light">проекты</span>
            </h2>
          </div>

          <div className="space-y-0">
            {works.map((w, i) => (
              <div
                key={w.num}
                className={`group flex items-center justify-between py-6 cursor-pointer transition-all duration-700 ${worksSection.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
                style={{
                  borderBottom: "1px solid rgba(232,168,48,0.08)",
                  transitionDelay: `${i * 100}ms`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.paddingLeft = "12px";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.paddingLeft = "0";
                }}
              >
                <div className="flex items-center gap-6">
                  <span
                    className="text-xs font-mono hidden md:block"
                    style={{ color: "var(--text-dim)" }}
                  >
                    {w.num}
                  </span>
                  <h3
                    className="text-xl md:text-2xl font-bold transition-colors duration-200 group-hover:text-gold"
                    style={{ color: "#EBE1CD" }}
                  >
                    {w.name}
                  </h3>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className="hidden md:block text-xs px-3 py-1 rounded-full"
                    style={{
                      background: "var(--gold-dim)",
                      color: "var(--gold)",
                      border: "1px solid rgba(232,168,48,0.15)",
                    }}
                  >
                    {w.tag}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-dim)" }}>{w.year}</span>
                  <Icon
                    name="ArrowUpRight"
                    size={18}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "var(--gold)" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--gold)" }}
            >
              Смотреть все работы <Icon name="ArrowRight" size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section ref={ctaSection.ref} id="contact" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`rounded-2xl p-10 md:p-16 text-center relative overflow-hidden transition-all duration-700 ${ctaSection.inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
            style={{
              background: "var(--surface-2)",
              border: "1px solid rgba(232,168,48,0.12)",
            }}
          >
            {/* Radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(232,168,48,0.06) 0%, transparent 60%)",
              }}
            />

            <div className="relative z-10">
              <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "var(--gold)" }}>
                Начнём работу
              </p>
              <h2
                className="text-4xl md:text-6xl font-black mb-4"
                style={{ color: "#EBE1CD" }}
              >
                Есть идея?
              </h2>
              <p
                className="text-4xl md:text-6xl font-cormorant italic font-light mb-8"
                style={{ color: "var(--gold)" }}
              >
                Давайте обсудим
              </p>
              <p
                className="text-base max-w-md mx-auto mb-10 leading-relaxed"
                style={{ color: "var(--text-dim)" }}
              >
                Оставьте заявку — ответим в течение 24 часов и предложим решение под вашу задачу.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="px-5 py-3 rounded text-sm w-full sm:w-72 outline-none focus:ring-2 transition-all"
                  style={{
                    background: "rgba(235,225,205,0.04)",
                    border: "1px solid rgba(235,225,205,0.1)",
                    color: "#EBE1CD",
                    caretColor: "var(--gold)",
                    focusRingColor: "var(--gold)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "rgba(232,168,48,0.4)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "rgba(235,225,205,0.1)";
                  }}
                />
                <button
                  className="px-7 py-3 rounded text-sm font-bold transition-all hover:scale-105 hover:shadow-lg w-full sm:w-auto"
                  style={{
                    background: "var(--gold)",
                    color: "#0e0c08",
                    boxShadow: "0 0 30px rgba(232,168,48,0.2)",
                  }}
                >
                  Отправить заявку
                </button>
              </div>

              <p className="text-xs mt-5" style={{ color: "var(--text-dim)" }}>
                Или напишите напрямую: <span style={{ color: "var(--gold)" }}>hello@studio.ru</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-10"
        style={{ borderTop: "1px solid rgba(232,168,48,0.08)" }}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-sm flex items-center justify-center"
              style={{ background: "var(--gold)" }}
            >
              <span className="text-xs font-black" style={{ color: "#0e0c08" }}>С</span>
            </div>
            <span className="font-bold" style={{ color: "#EBE1CD" }}>Студия</span>
          </div>

          <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
            © 2024 Студия. Все права защищены.
          </p>

          <div className="flex items-center gap-5">
            {[
              { icon: "Send", label: "Telegram" },
              { icon: "MessageSquare", label: "VK" },
              { icon: "Linkedin", label: "LinkedIn" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                className="transition-all hover:scale-110"
                title={s.label}
                style={{ color: "var(--text-dim)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--gold)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
              >
                <Icon name={s.icon} fallback="Link" size={16} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}