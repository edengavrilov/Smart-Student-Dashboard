import { useState, useEffect } from "react";
import axios from "axios";
import ScheduleForm from "./ScheduleForm";

const GRID_START = 8;
const GRID_END = 20;
const TOTAL_HOURS = GRID_END - GRID_START;
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + GRID_START);

const DAY_INDICES = [0, 1, 2, 3, 4, 5];

const SEMESTER_VALUES = ["A", "B", "Summer"];

const translations = {
  en: {
    title: "Weekly Schedule",
    addCourse: "+ Add Course",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"],
    delete: "Delete",
    filters: ["A", "B", "Summer"],
    semesterLabels: { A: "Semester A", B: "Semester B", Summer: "Summer" },
  },
  he: {
    title: "מערכת שעות שבועית",
    addCourse: "+ הוספת קורס",
    days: ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳"],
    delete: "מחק",
    filters: ["א", "ב", "קיץ"],
    semesterLabels: { A: "סמסטר א", B: "סמסטר ב", Summer: "קיץ" },
  },
};

function parseTime(timeStr) {
  const parts = timeStr.split(":").map(Number);
  return { h: parts[0], m: parts[1] };
}

function toPercent(timeStr) {
  const { h, m } = parseTime(timeStr);
  return ((h - GRID_START + m / 60) / TOTAL_HOURS) * 100;
}

function durationPercent(startStr, endStr) {
  const s = parseTime(startStr);
  const e = parseTime(endStr);
  return ((e.h * 60 + e.m - s.h * 60 - s.m) / 60 / TOTAL_HOURS) * 100;
}

function durationMinutes(startStr, endStr) {
  const s = parseTime(startStr);
  const e = parseTime(endStr);
  return e.h * 60 + e.m - s.h * 60 - s.m;
}

function formatTime(timeStr) {
  const { h, m } = parseTime(timeStr);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "100, 100, 100";
}

export default function SchedulePage({ language }) {
  const [items, setItems] = useState([]);
  const [formState, setFormState] = useState(null); // null | { initialData } — null=closed
  const [semFilter, setSemFilter] = useState("A");
  const t = translations[language];

  const fetchSchedule = async () => {
    try {
      const res = await axios.get("https://localhost:7137/api/Schedule");
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching schedule:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`https://localhost:7137/api/Schedule/${id}`);
      fetchSchedule();
    } catch (err) {
      console.error("Error deleting schedule item:", err);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const displayedItems = items.filter((item) => item.semester === semFilter);

  const itemsByDay = DAY_INDICES.reduce((acc, d) => {
    acc[d] = displayedItems.filter((item) => item.dayOfWeek === d);
    return acc;
  }, {});

  return (
    <div className="h-screen flex flex-col overflow-hidden py-4 px-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h1 className="text-3xl font-extrabold text-[#4a3728] tracking-tight drop-shadow-sm">
          {t.title}
        </h1>
        <button
          onClick={() => setFormState({ initialData: null })}
          className="bg-[#a57b5a] hover:bg-[#8e684a] text-white font-bold px-5 py-2.5 rounded-2xl shadow-md active:scale-[0.98] transition-all"
        >
          {t.addCourse}
        </button>
      </div>

      {/* Semester filter pills */}
      <div className="flex gap-2 mb-3 shrink-0 flex-wrap">
        {SEMESTER_VALUES.map((val, i) => (
          <button
            key={val}
            onClick={() => setSemFilter(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
              semFilter === val
                ? "bg-[#4a3728] text-white border-[#4a3728] shadow-sm"
                : "bg-white/50 text-[#4a3728] border-[#e6beae] hover:bg-[#e7d8c9]"
            }`}
          >
            {t.filters[i]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 rounded-3xl border border-[#e6beae]/40 shadow-lg bg-white/60 overflow-hidden flex flex-col">
        {/* Day headers */}
        <div
          className="grid shrink-0"
          style={{ gridTemplateColumns: "52px repeat(6, 1fr)" }}
        >
          <div className="bg-[#e7d8c9] border-b border-e border-[#e6beae]/60 h-10" />
          {DAY_INDICES.map((d, i) => (
            <div
              key={d}
              className="bg-[#e7d8c9] border-b border-e border-[#e6beae]/60 h-10 flex items-center justify-center font-bold text-[#4a3728] text-sm last:border-e-0"
            >
              {t.days[i]}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div
          className="grid flex-1"
          style={{ gridTemplateColumns: "52px repeat(6, 1fr)" }}
        >
          {/* Hour labels */}
          <div className="relative">
            {HOURS.map((h) =>
              h < GRID_END ? (
                <div
                  key={h}
                  className="absolute w-full flex justify-center"
                  style={{ top: `${((h - GRID_START) / TOTAL_HOURS) * 100}%` }}
                >
                  <span className="text-[10px] font-semibold text-[#a57b5a] leading-none mt-0.5">
                    {String(h).padStart(2, "0")}:00
                  </span>
                </div>
              ) : null
            )}
          </div>

          {/* Day columns */}
          {DAY_INDICES.map((d) => (
            <div
              key={d}
              className="relative border-s border-[#e6beae]/40 last:border-e-0"
            >
              {/* Hour dividers */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute w-full border-t border-[#e6beae]/40"
                  style={{ top: `${((h - GRID_START) / TOTAL_HOURS) * 100}%` }}
                />
              ))}

              {/* Course blocks */}
              {itemsByDay[d].map((item) => {
                const top = toPercent(item.startTime);
                const height = durationPercent(item.startTime, item.endTime);
                const mins = durationMinutes(item.startTime, item.endTime);
                const rgb = hexToRgb(item.color || "#a57b5a");
                const hasTooltip = item.instructor || item.location || item.semester;

                return (
                  <div
                    key={item.id}
                    className="group/card absolute inset-x-0.5 rounded-xl px-1.5 py-1 overflow-visible cursor-pointer"
                    style={{
                      top: `${top}%`,
                      height: `max(${height}%, 24px)`,
                      backgroundColor: `rgba(${rgb}, 0.22)`,
                      borderInlineStart: `3px solid rgba(${rgb}, 0.9)`,
                    }}
                    onClick={() => setFormState({ initialData: item })}
                  >
                    {/* Always-visible content: name + time */}
                    <p
                      className="text-[11px] font-bold leading-tight truncate"
                      style={{ color: `rgba(${rgb}, 1)` }}
                    >
                      {item.courseName}
                    </p>
                    {mins >= 45 && (
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {formatTime(item.startTime)}–{formatTime(item.endTime)}
                      </p>
                    )}

                    {/* Tooltip on hover */}
                    {hasTooltip && (
                      <div className="pointer-events-none absolute z-30 top-full mt-1.5 start-0 w-44 bg-[#3a2a1e] text-white rounded-xl p-2.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-150 shadow-xl">
                        {/* Arrow pointing up */}
                        <div className="absolute bottom-full start-3 border-4 border-transparent border-b-[#3a2a1e]" />
                        {item.instructor && (
                          <p className="text-[11px] font-semibold truncate">{item.instructor}</p>
                        )}
                        {item.location && (
                          <p className="text-[10px] text-white/70 truncate mt-0.5">{item.location}</p>
                        )}
                        {item.semester && (
                          <p className="text-[10px] text-white/50 mt-0.5">
                            {t.semesterLabels[item.semester] ?? item.semester}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Delete on hover — stop propagation so it doesn't open the edit form */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                      className="absolute top-0.5 end-0.5 hidden group-hover/card:flex items-center justify-center w-5 h-5 rounded-full bg-white/80 text-rose-400 hover:bg-rose-100 transition-all text-xs font-bold"
                      title={t.delete}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Form modal — add (initialData=null) or edit (initialData=item) */}
      {formState !== null && (
        <ScheduleForm
          language={language}
          initialData={formState.initialData}
          onClose={() => setFormState(null)}
          onSaved={fetchSchedule}
        />
      )}
    </div>
  );
}
