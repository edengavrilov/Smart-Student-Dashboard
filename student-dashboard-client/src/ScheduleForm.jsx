import { useState } from "react";
import axios from "axios";

const PRESET_COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#fbbf24", // amber
  "#34d399", // emerald
  "#38bdf8", // sky
  "#818cf8", // indigo
  "#c084fc", // purple
  "#f472b6", // pink
  "#a57b5a", // brown (theme)
  "#64748b", // slate
];

const translations = {
  en: {
    titleAdd: "Add Course",
    titleEdit: "Edit Course",
    courseName: "Course Name",
    instructor: "Instructor",
    day: "Day",
    startTime: "Start Time",
    endTime: "End Time",
    location: "Location",
    color: "Color",
    semester: "Semester",
    cancel: "Cancel",
    save: "Save",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    semesters: ["Semester A", "Semester B", "Summer"],
    semesterValues: ["A", "B", "Summer"],
  },
  he: {
    titleAdd: "הוספת קורס",
    titleEdit: "עריכת קורס",
    courseName: "שם הקורס",
    instructor: "מרצה",
    day: "יום",
    startTime: "שעת התחלה",
    endTime: "שעת סיום",
    location: "מיקום",
    color: "צבע",
    semester: "סמסטר",
    cancel: "ביטול",
    save: "שמור",
    days: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי"],
    semesters: ["סמסטר א", "סמסטר ב", "קיץ"],
    semesterValues: ["A", "B", "Summer"],
  },
};

const inputClass =
  "w-full px-4 py-3 bg-[#eee4e1] border border-[#e6beae]/50 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none transition-all text-slate-700 placeholder:text-slate-400";

const labelClass = "block text-sm font-semibold text-[#4a3728] mb-1";

// "HH:MM:SS" → "HH:MM" for <input type="time">
function toTimeInput(str) {
  return str ? str.slice(0, 5) : "08:00";
}

export default function ScheduleForm({ language, onClose, onSaved, initialData }) {
  const t = translations[language];
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState(() =>
    isEdit
      ? {
          courseName: initialData.courseName || "",
          instructor: initialData.instructor || "",
          dayOfWeek: initialData.dayOfWeek ?? 0,
          startTime: toTimeInput(initialData.startTime),
          endTime: toTimeInput(initialData.endTime),
          location: initialData.location || "",
          color: initialData.color || PRESET_COLORS[4],
          semester: initialData.semester || "A",
        }
      : {
          courseName: "",
          instructor: "",
          dayOfWeek: 0,
          startTime: "08:00",
          endTime: "10:00",
          location: "",
          color: PRESET_COLORS[4],
          semester: "A",
        }
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.courseName.trim()) return;
    setSaving(true);
    setError("");
    const payload = {
      courseName: form.courseName,
      instructor: form.instructor,
      dayOfWeek: Number(form.dayOfWeek),
      startTime: form.startTime + ":00",
      endTime: form.endTime + ":00",
      location: form.location,
      color: form.color,
      semester: form.semester,
    };
    try {
      if (isEdit) {
        await axios.put(`https://localhost:7137/api/Schedule/${initialData.id}`, {
          id: initialData.id,
          ...payload,
        });
      } else {
        await axios.post("https://localhost:7137/api/Schedule", { id: 0, ...payload });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.title || "Error saving course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-[#e6beae]/30 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-extrabold text-[#4a3728] mb-6">
          {isEdit ? t.titleEdit : t.titleAdd}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Course name */}
          <div>
            <label className={labelClass}>{t.courseName}</label>
            <input
              type="text"
              required
              value={form.courseName}
              onChange={(e) => set("courseName", e.target.value)}
              placeholder={t.courseName}
              className={inputClass}
            />
          </div>

          {/* Instructor */}
          <div>
            <label className={labelClass}>{t.instructor}</label>
            <input
              type="text"
              value={form.instructor}
              onChange={(e) => set("instructor", e.target.value)}
              placeholder={t.instructor}
              className={inputClass}
            />
          </div>

          {/* Day */}
          <div>
            <label className={labelClass}>{t.day}</label>
            <select
              value={form.dayOfWeek}
              onChange={(e) => set("dayOfWeek", e.target.value)}
              className={inputClass}
            >
              {t.days.map((day, i) => (
                <option key={i} value={i}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          {/* Times */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>{t.startTime}</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => set("startTime", e.target.value)}
                min="08:00"
                max="20:00"
                className={inputClass}
              />
            </div>
            <div className="flex-1">
              <label className={labelClass}>{t.endTime}</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => set("endTime", e.target.value)}
                min="08:00"
                max="20:00"
                className={inputClass}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelClass}>{t.location}</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder={t.location}
              className={inputClass}
            />
          </div>

          {/* Semester */}
          <div>
            <label className={labelClass}>{t.semester}</label>
            <select
              value={form.semester}
              onChange={(e) => set("semester", e.target.value)}
              className={inputClass}
            >
              {t.semesters.map((sem, i) => (
                <option key={i} value={t.semesterValues[i]}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Color picker */}
          <div>
            <label className={labelClass}>{t.color}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("color", c)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? "#4a3728" : "transparent",
                    boxShadow: form.color === c ? "0 0 0 2px #fff inset" : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-semibold border border-[#e6beae] text-[#4a3728] hover:bg-[#eee4e1] transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl font-bold bg-[#a57b5a] hover:bg-[#8e684a] text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
