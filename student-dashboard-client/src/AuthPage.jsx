import { useState } from "react";
import axios from "axios";
import { API_BASE } from "./apiConfig";

const AUTH_BASE = `${API_BASE}/Auth`;

const translations = {
  en: {
    loginTitle: "Welcome Back",
    registerTitle: "Create Account",
    loginSubtitle: "Sign in to your dashboard",
    registerSubtitle: "Join Smart Student Dashboard",
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    loginButton: "Sign In",
    registerButton: "Create Account",
    switchToRegister: "Don't have an account? Register",
    switchToLogin: "Already have an account? Sign in",
    loading: "Please wait...",
    invalidEmail: "Please enter a valid email address",
    registrationSuccess: "Registration successful! Please sign in.",
    fullNamePlaceholder: "Your full name",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "Your password",
  },
  he: {
    loginTitle: "Welcome Back",
    registerTitle: "צור חשבון",
    loginSubtitle: "התחבר ללוח הסטודנט שלך",
    registerSubtitle: "הצטרף ל-Smart Student Dashboard",
    fullName: "שם מלא",
    email: "אימייל",
    password: "סיסמה",
    loginButton: "כניסה",
    registerButton: "צור חשבון",
    switchToRegister: "אין לך חשבון? הירשם",
    switchToLogin: "כבר יש לך חשבון? התחבר",
    loading: "...אנא המתן",
    invalidEmail: "אנא הזן כתובת אימייל תקינה",
    registrationSuccess: "ההרשמה הצליחה! אנא התחבר.",
    fullNamePlaceholder: "השם המלא שלך",
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "הסיסמה שלך",
  },
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthPage({ language, onLogin, onToggleLanguage }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const t = translations[language];
  const isRegister = mode === "register";
  const isRTL = language === "he";

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setError("");
    setSuccessMsg("");
    setFullName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isValidEmail(email)) {
      setError(t.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await axios.post(`${AUTH_BASE}/register`, {
          fullName,
          email,
          password,
        });
        setSuccessMsg(t.registrationSuccess);
        setMode("login");
        setFullName("");
        setPassword("");
      } else {
        const res = await axios.post(`${AUTH_BASE}/login`, { email, password });
        onLogin(res.data.token, res.data.fullName);
      }
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "string") setError(data);
      else setError(data?.title || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none transition-all text-slate-700 placeholder:text-slate-400";

  return (
    <div
      className="min-h-screen bg-[#eee4e1] flex items-center justify-center p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Language toggle — top corner */}
      <button
        onClick={onToggleLanguage}
        className="fixed top-4 end-4 bg-[#4a3728] hover:bg-[#6b4f3a] text-[#e7d8c9] text-sm font-bold px-4 py-2 rounded-full shadow-md transition-all"
      >
        {language === "en" ? "עברית" : "English"}
      </button>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#4a3728] rounded-2xl shadow-xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#e7d8c9]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l6.16-3.422A12.083 12.083 0 0121 13c0 4.418-4.03 8-9 8s-9-3.582-9-8c0-.45.04-.893.117-1.326L12 14z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-[#4a3728]">
            {isRegister ? t.registerTitle : t.loginTitle}
          </h1>
          <p className="text-[#a57b5a] mt-1 text-sm font-medium">
            {isRegister ? t.registerSubtitle : t.loginSubtitle}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-[#e6beae]/30 p-8">
          {successMsg && (
            <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-[#4a3728] mb-1.5">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#4a3728] mb-1.5">
                {t.email}
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#4a3728] mb-1.5">
                {t.password}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-rose-500 text-sm font-medium bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-bold bg-[#a57b5a] hover:bg-[#8e684a] text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-60 mt-1"
            >
              {loading
                ? t.loading
                : isRegister
                  ? t.registerButton
                  : t.loginButton}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={switchMode}
              className="text-sm text-[#a57b5a] hover:text-[#4a3728] font-semibold transition-colors underline-offset-2 hover:underline"
            >
              {isRegister ? t.switchToLogin : t.switchToRegister}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
