import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  login: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (login: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (login: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authMode: "login" | "register";
  setAuthMode: (v: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("kazah_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const register = async (login: string, email: string, password: string) => {
    if (!login.trim() || login.length < 3) {
      return { success: false, error: "Логин должен быть не менее 3 символов" };
    }
    if (!email.includes("@") || !email.includes(".")) {
      return { success: false, error: "Введите корректный email" };
    }
    if (password.length < 6) {
      return { success: false, error: "Пароль должен быть не менее 6 символов" };
    }

    // Check if login already exists
    const existing = localStorage.getItem(`kazah_account_${login.toLowerCase()}`);
    if (existing) {
      return { success: false, error: "Этот логин уже занят" };
    }

    // Save account
    const account = { login, email, password };
    localStorage.setItem(`kazah_account_${login.toLowerCase()}`, JSON.stringify(account));

    const newUser = { login, email };
    localStorage.setItem("kazah_user", JSON.stringify(newUser));
    setUser(newUser);
    setShowAuthModal(false);
    return { success: true };
  };

  const login = async (login: string, _email: string, password: string) => {
    if (!login.trim()) {
      return { success: false, error: "Введите логин" };
    }
    if (!password) {
      return { success: false, error: "Введите пароль" };
    }

    const saved = localStorage.getItem(`kazah_account_${login.toLowerCase()}`);
    if (!saved) {
      return { success: false, error: "Аккаунт не найден" };
    }

    const account = JSON.parse(saved);
    if (account.password !== password) {
      return { success: false, error: "Неверный пароль" };
    }

    const loggedUser = { login: account.login, email: account.email };
    localStorage.setItem("kazah_user", JSON.stringify(loggedUser));
    setUser(loggedUser);
    setShowAuthModal(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("kazah_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, showAuthModal, setShowAuthModal, authMode, setAuthMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
