import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [loginVal, setLoginVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setError("");
    setLoginVal("");
    setEmailVal("");
    setPasswordVal("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let result;
    if (authMode === "register") {
      result = await register(loginVal, emailVal, passwordVal);
    } else {
      result = await login(loginVal, emailVal, passwordVal);
    }

    setLoading(false);
    if (!result.success) {
      setError(result.error || "Ошибка");
    } else {
      setLoginVal("");
      setEmailVal("");
      setPasswordVal("");
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #1c1710, #141109)",
          border: "1px solid rgba(232,168,48,0.25)",
          boxShadow: "0 0 80px rgba(232,168,48,0.08), 0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between border-b"
          style={{ borderColor: "rgba(232,168,48,0.12)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-black"
              style={{ background: "linear-gradient(135deg, #e8a830, #c47a10)", color: "#0e0c08" }}
            >
              ♠
            </div>
            <div>
              <span className="text-lg font-black" style={{ color: "#ebe1cd" }}>KAZAH</span>
              <span className="text-lg font-black" style={{ color: "#e8a830" }}> CASINO</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110"
            style={{ color: "rgba(235,225,205,0.4)", background: "rgba(235,225,205,0.05)" }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: "rgba(232,168,48,0.12)" }}
        >
          {(["login", "register"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setAuthMode(mode); setError(""); }}
              className="flex-1 py-3.5 text-sm font-bold transition-all"
              style={{
                color: authMode === mode ? "#e8a830" : "rgba(235,225,205,0.4)",
                borderBottom: authMode === mode ? "2px solid #e8a830" : "2px solid transparent",
                background: authMode === mode ? "rgba(232,168,48,0.05)" : "transparent",
              }}
            >
              {mode === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "rgba(232,168,48,0.7)" }}
            >
              Логин
            </label>
            <input
              type="text"
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              placeholder="Ваш логин"
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,168,48,0.2)",
                color: "#ebe1cd",
                caretColor: "#e8a830",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(232,168,48,0.6)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(232,168,48,0.2)")}
            />
          </div>

          {authMode === "register" && (
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-widest mb-1.5"
                style={{ color: "rgba(232,168,48,0.7)" }}
              >
                Электронная почта
              </label>
              <input
                type="email"
                value={emailVal}
                onChange={(e) => setEmailVal(e.target.value)}
                placeholder="example@mail.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(232,168,48,0.2)",
                  color: "#ebe1cd",
                  caretColor: "#e8a830",
                }}
                onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(232,168,48,0.6)")}
                onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(232,168,48,0.2)")}
              />
            </div>
          )}

          <div>
            <label
              className="block text-xs font-bold uppercase tracking-widest mb-1.5"
              style={{ color: "rgba(232,168,48,0.7)" }}
            >
              Пароль
            </label>
            <input
              type="password"
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
              placeholder={authMode === "register" ? "Минимум 6 символов" : "Ваш пароль"}
              autoComplete={authMode === "register" ? "new-password" : "current-password"}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(232,168,48,0.2)",
                color: "#ebe1cd",
                caretColor: "#e8a830",
              }}
              onFocus={(e) => (e.currentTarget.style.border = "1px solid rgba(232,168,48,0.6)")}
              onBlur={(e) => (e.currentTarget.style.border = "1px solid rgba(232,168,48,0.2)")}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-black tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: loading ? "rgba(232,168,48,0.5)" : "linear-gradient(135deg, #e8a830, #c47a10)",
              color: "#0e0c08",
              boxShadow: "0 4px 20px rgba(232,168,48,0.25)",
            }}
          >
            {loading ? "..." : authMode === "login" ? "Войти" : "Создать аккаунт"}
          </button>

          {/* Switch mode */}
          <p className="text-center text-sm" style={{ color: "rgba(235,225,205,0.4)" }}>
            {authMode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
            {" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-bold transition-colors"
              style={{ color: "#e8a830" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f5c842")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#e8a830")}
            >
              {authMode === "login" ? "Зарегистрироваться" : "Войти"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
