import { useState } from "react";
import TasksPage from "./TasksPage";
import SchedulePage from "./SchedulePage";
import AuthPage from "./AuthPage";

const translations = {
  en: {
    dashboard: "Student Dashboard",
    tasks: "Tasks",
    schedule: "Schedule",
    logout: "Logout",
  },
  he: {
    dashboard: "לוח סטודנט",
    tasks: "משימות",
    schedule: "מערכת שעות",
    logout: "יציאה",
  },
};

const NAV_ICONS = {
  tasks: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  ),
  schedule: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
};

const LANG_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
    />
  </svg>
);

const LOGOUT_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export default function App() {
  const [language, setLanguage] = useState("en");
  const [activePage, setActivePage] = useState("tasks");
  const [token, setToken] = useState(null);
  const [userName, setUserName] = useState(null);

  const t = translations[language];
  const isRTL = language === "he";

  const handleLogin = (jwt, name) => {
    setToken(jwt);
    setUserName(name);
  };

  const handleLogout = () => {
    setToken(null);
    setUserName(null);
  };

  if (!token) {
    return (
      <AuthPage
        language={language}
        onLogin={handleLogin}
        onToggleLanguage={() => setLanguage(language === "en" ? "he" : "en")}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-[#eee4e1] font-sans text-slate-800 flex"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <aside className="group w-16 hover:w-56 shrink-0 min-h-screen bg-[#4a3728] text-white hidden md:flex flex-col py-8 shadow-2xl transition-[width] duration-300 overflow-hidden z-10">
        {/* Title */}
        <div className="flex items-center h-10 mb-10 px-3">
          {/* Icon always visible */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0 text-[#e7d8c9]/80"
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
          {/* Text slides in */}
          <span className="ms-3 opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[160px] overflow-hidden transition-all duration-300 whitespace-nowrap text-sm font-extrabold text-[#e7d8c9]/90 leading-snug">
            {t.dashboard}
          </span>
        </div>

        {/* Nav */}
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === "en" ? "he" : "en")}
          className="mx-3 mb-4 bg-white/10 hover:bg-white/20 py-2 rounded-full font-bold transition-all text-[#e7d8c9] flex items-center"
        >
          <span className="w-10 flex items-center justify-center shrink-0">
            {LANG_ICON}
          </span>
          <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[100px] overflow-hidden transition-all duration-300 whitespace-nowrap text-sm">
            {language === "en" ? "עברית" : "English"}
          </span>
        </button>

        <nav className="flex flex-col gap-1 flex-1 px-3">
          {["tasks", "schedule"].map((page) => (
            <button
              key={page}
              onClick={() => setActivePage(page)}
              className={`flex items-center py-3 rounded-2xl font-semibold transition-all ${
                activePage === page
                  ? "bg-[#a57b5a] text-white shadow-md"
                  : "text-[#e7d8c9]/70 hover:bg-white/10 hover:text-[#e7d8c9]"
              }`}
            >
              {/* Icon in a fixed-width centered container */}
              <span className="w-10 flex items-center justify-center shrink-0">
                {NAV_ICONS[page]}
              </span>
              {/* Label slides in */}
              <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[120px] overflow-hidden transition-all duration-300 whitespace-nowrap">
                {t[page]}
              </span>
            </button>
          ))}
        </nav>

        {/* User name + logout at the bottom */}
        <div className="px-3 mt-4 mb-2 flex flex-col gap-2">
          {/* User name */}
          <div className="flex items-center overflow-hidden">
            <span className="w-10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e7d8c9]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[140px] overflow-hidden transition-all duration-300 whitespace-nowrap text-xs text-[#e7d8c9]/60 font-medium truncate">
              {userName}
            </span>
          </div>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center py-2.5 rounded-2xl font-semibold transition-all text-[#e7d8c9]/70 hover:bg-white/10 hover:text-[#e7d8c9]"
          >
            <span className="w-10 flex items-center justify-center shrink-0">
              {LOGOUT_ICON}
            </span>
            <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-[120px] overflow-hidden transition-all duration-300 whitespace-nowrap">
              {t.logout}
            </span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto pb-16 md:pb-0">
        {activePage === "tasks" ? (
          <TasksPage language={language} token={token} />
        ) : (
          <SchedulePage language={language} token={token} />
        )}
      </main>

      {/* Bottom navigation — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#4a3728] text-white flex items-center justify-around px-2 pt-2 pb-3 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        {["tasks", "schedule"].map((page) => (
          <button
            key={page}
            onClick={() => setActivePage(page)}
            className={`flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-all ${
              activePage === page
                ? "text-white bg-[#a57b5a]/40"
                : "text-[#e7d8c9]/60"
            }`}
          >
            {NAV_ICONS[page]}
            <span className="text-[10px] font-semibold tracking-wide">
              {t[page]}
            </span>
          </button>
        ))}
        <button
          onClick={() => setLanguage(language === "en" ? "he" : "en")}
          className="flex flex-col items-center gap-1 px-6 py-1 rounded-xl text-[#e7d8c9]/60"
        >
          {LANG_ICON}
          <span className="text-[10px] font-semibold tracking-wide">
            {language === "en" ? "עב׳" : "EN"}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-6 py-1 rounded-xl text-[#e7d8c9]/60"
        >
          {LOGOUT_ICON}
          <span className="text-[10px] font-semibold tracking-wide">
            {t.logout}
          </span>
        </button>
      </nav>
    </div>
  );
}
