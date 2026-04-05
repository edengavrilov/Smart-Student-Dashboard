import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/Grades`;

const translations = {
  en: {
    title: "My Grades",
    addCourse: "+ Add Course",
    weightedAvg: "Weighted Average",
    totalCredits: "Total Credits",
    gradedCredits: "Graded Credits",
    noGrades: "No courses yet — add your first one!",
    credits: "cr.",
    allSemesters: "All",
    showBreakdown: "Breakdown",
    hideBreakdown: "Hide",
    notGraded: "Not graded",
    addCourseTitle: "Add Course",
    editCourseTitle: "Edit Course",
    courseName: "Course Name",
    courseNamePlaceholder: "e.g. Introduction to CS",
    creditsLabel: "Credits",
    semesterLabel: "Semester",
    yearLabel: "Year",
    finalScoreLabel: "Final Score (optional)",
    autoScore: "Auto-calculate from components",
    computedScore: "Computed:",
    componentsTitle: "Grade Components",
    addComponent: "+ Add Component",
    compNamePlaceholder: "e.g. Midterm",
    compWeight: "Weight %",
    compScore: "Score",
    weightSum: "Weight total",
    save: "Save",
    cancel: "Cancel",
    deleteCourse: "Delete Course",
    loading: "Loading...",
    predictor: "Grade Predictor",
    predictorDesc: "Find out what score you need on remaining courses",
    targetAvg: "Target Average",
    calculate: "Calculate",
    requiredScore: "Required score on remaining courses",
    alreadyAchieved: "Target already achieved with current grades!",
    unachievable: "Target cannot be achieved (would need more than 100)",
    allGraded: "All courses are graded!",
    currentAvg: "Current average",
    ungradedCourses: "Remaining courses",
    noCourses: "Add courses first",
    semA: "Semester A",
    semB: "Semester B",
    semSummer: "Summer",
  },
  he: {
    title: "הציונים שלי",
    addCourse: "+ הוסף קורס",
    weightedAvg: "ממוצע משוקלל",
    totalCredits: 'סה"כ נק"ז',
    gradedCredits: 'נק"ז בציון',
    noGrades: "!אין קורסים עדיין — הוסף את הראשון",
    credits: 'נק"ז',
    allSemesters: "הכל",
    showBreakdown: "פירוט",
    hideBreakdown: "הסתר",
    notGraded: "טרם ציון",
    addCourseTitle: "הוסף קורס",
    editCourseTitle: "ערוך קורס",
    courseName: "שם הקורס",
    courseNamePlaceholder: "למשל: מבוא למדעי המחשב",
    creditsLabel: 'נק"ז',
    semesterLabel: "סמסטר",
    yearLabel: "שנה",
    finalScoreLabel: "ציון סופי (אופציונלי)",
    autoScore: "חשב אוטומטית מרכיבים",
    computedScore: "מחושב:",
    componentsTitle: "רכיבי הציון",
    addComponent: "+ הוסף רכיב",
    compNamePlaceholder: "למשל: מבחן אמצע",
    compWeight: "משקל %",
    compScore: "ציון",
    weightSum: "סכום משקלים",
    save: "שמור",
    cancel: "ביטול",
    deleteCourse: "מחק קורס",
    loading: "...טוען",
    predictor: "מחשבון ציונים",
    predictorDesc: "מה הציון שאתה צריך בקורסים הנותרים?",
    targetAvg: "ממוצע יעד",
    calculate: "חשב",
    requiredScore: "ציון נדרש בקורסים הנותרים",
    alreadyAchieved: "!היעד כבר הושג עם הציונים הנוכחיים",
    unachievable: "הגעה ליעד אינה אפשרית (נדרש ציון מעל 100)",
    allGraded: "!כל הקורסים קיבלו ציון",
    currentAvg: "ממוצע נוכחי",
    ungradedCourses: "קורסים ללא ציון",
    noCourses: "הוסף קורסים תחילה",
    semA: "סמסטר א׳",
    semB: "סמסטר ב׳",
    semSummer: "קיץ",
  },
};

const SEMESTERS = ["A", "B", "Summer"];
const YEARS = ["2022/23", "2023/24", "2024/25", "2025/26", "2026/27"];

function semLabel(s, t) {
  if (s === "A") return t.semA;
  if (s === "B") return t.semB;
  if (s === "Summer") return t.semSummer;
  return s;
}

function scoreColors(score) {
  if (score == null) return { bg: "#f1f5f9", text: "#94a3b8" };
  if (score >= 90) return { bg: "#d1fae5", text: "#065f46" };
  if (score >= 80) return { bg: "#dbeafe", text: "#1e40af" };
  if (score >= 70) return { bg: "#e0f2fe", text: "#0369a1" };
  if (score >= 60) return { bg: "#fef3c7", text: "#92400e" };
  return { bg: "#fee2e2", text: "#991b1b" };
}

function computeAutoScore(components) {
  const scored = components.filter(
    (c) => c.score !== "" && c.score !== null && !isNaN(Number(c.score))
  );
  if (!scored.length) return null;
  const totalW = scored.reduce((s, c) => s + Number(c.weight), 0);
  if (!totalW) return null;
  return Math.round((scored.reduce((s, c) => s + Number(c.weight) * Number(c.score), 0) / totalW) * 10) / 10;
}

// ── Icons ────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);
const CalcIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// ── GradeModal ───────────────────────────────────────────────────────────────
function GradeModal({ language, grade, onClose, onSaved, token }) {
  const t = translations[language];
  const isEdit = !!grade;
  const isRTL = language === "he";

  const [form, setForm] = useState(() =>
    grade
      ? {
          courseName: grade.courseName,
          credits: grade.credits,
          semester: grade.semester || "A",
          year: grade.year || "2025/26",
          finalScore: grade.finalScore != null ? String(grade.finalScore) : "",
          useAutoScore: false,
          components: grade.components.map((c, i) => ({
            tempId: i,
            name: c.name,
            weight: String(c.weight),
            score: c.score != null ? String(c.score) : "",
          })),
        }
      : {
          courseName: "",
          credits: 3,
          semester: "A",
          year: "2025/26",
          finalScore: "",
          useAutoScore: false,
          components: [],
        }
  );
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const computedScore = useMemo(() => computeAutoScore(form.components), [form.components]);

  const totalWeight = form.components.reduce((s, c) => s + (Number(c.weight) || 0), 0);

  const addComponent = () =>
    setForm((f) => ({
      ...f,
      components: [...f.components, { tempId: Date.now(), name: "", weight: "", score: "" }],
    }));

  const updateComp = (tempId, field, val) =>
    setForm((f) => ({
      ...f,
      components: f.components.map((c) => (c.tempId === tempId ? { ...c, [field]: val } : c)),
    }));

  const removeComp = (tempId) =>
    setForm((f) => ({ ...f, components: f.components.filter((c) => c.tempId !== tempId) }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.courseName.trim()) return setError("Course name is required");
    setError("");
    setSaving(true);

    const finalScoreValue = form.useAutoScore
      ? computedScore
      : form.finalScore !== ""
      ? Number(form.finalScore)
      : null;

    const payload = {
      courseName: form.courseName.trim(),
      credits: Number(form.credits),
      semester: form.semester,
      year: form.year,
      finalScore: finalScoreValue,
      components: form.components
        .filter((c) => c.name.trim())
        .map((c) => ({
          name: c.name.trim(),
          weight: Number(c.weight) || 0,
          score: c.score !== "" ? Number(c.score) : null,
        })),
    };

    try {
      if (isEdit) {
        await axios.put(`${API}/${grade.id}`, payload, authHeader);
      } else {
        await axios.post(API, payload, authHeader);
      }
      onSaved();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "string" ? data : data?.title || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await axios.delete(`${API}/${grade.id}`, authHeader);
      onSaved();
      onClose();
    } catch {
      setError("Failed to delete");
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none text-sm text-slate-700";
  const labelCls = "block text-xs font-bold text-[#4a3728]/60 uppercase tracking-wider mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-[#e6beae]/30 max-h-[92vh] overflow-y-auto"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Modal header */}
        <div className="bg-[#4a3728] rounded-t-3xl px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-lg font-extrabold text-[#e7d8c9]">
            {isEdit ? t.editCourseTitle : t.addCourseTitle}
          </h2>
          <button onClick={onClose} className="text-[#e7d8c9]/60 hover:text-[#e7d8c9] transition-all">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          {/* Course name */}
          <div>
            <label className={labelCls}>{t.courseName}</label>
            <input
              type="text"
              required
              value={form.courseName}
              onChange={(e) => setForm((f) => ({ ...f, courseName: e.target.value }))}
              placeholder={t.courseNamePlaceholder}
              className={inputCls}
            />
          </div>

          {/* Credits / Semester / Year */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>{t.creditsLabel}</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.credits}
                onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{t.semesterLabel}</label>
              <select
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
                className={inputCls}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{semLabel(s, t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{t.yearLabel}</label>
              <select
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                className={inputCls}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Auto-calculate toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.useAutoScore}
              onChange={(e) => setForm((f) => ({ ...f, useAutoScore: e.target.checked }))}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors relative ${form.useAutoScore ? "bg-[#a57b5a]" : "bg-slate-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.useAutoScore ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-sm font-semibold text-[#4a3728]">{t.autoScore}</span>
            {form.useAutoScore && computedScore != null && (
              <span className="text-xs font-bold text-[#a57b5a]">
                {t.computedScore} {computedScore}
              </span>
            )}
          </label>

          {/* Manual final score */}
          {!form.useAutoScore && (
            <div>
              <label className={labelCls}>{t.finalScoreLabel}</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.finalScore}
                onChange={(e) => setForm((f) => ({ ...f, finalScore: e.target.value }))}
                placeholder="0 – 100"
                className={inputCls}
              />
            </div>
          )}

          {/* Components */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={labelCls + " mb-0"}>{t.componentsTitle}</label>
              {form.components.length > 0 && (
                <span className={`text-xs font-semibold ${Math.abs(totalWeight - 100) < 0.5 ? "text-emerald-600" : "text-amber-500"}`}>
                  {t.weightSum}: {totalWeight.toFixed(0)}%
                </span>
              )}
            </div>

            {/* Header row for components */}
            {form.components.length > 0 && (
              <div className="flex gap-2 mb-1.5 px-1">
                <span className="flex-[3] text-[10px] font-bold text-[#4a3728]/40 uppercase tracking-wider">{t.courseName}</span>
                <span className="flex-1 text-[10px] font-bold text-[#4a3728]/40 uppercase tracking-wider">{t.compWeight}</span>
                <span className="flex-[2] text-[10px] font-bold text-[#4a3728]/40 uppercase tracking-wider">{t.compScore}</span>
                <span className="w-8 shrink-0" />
              </div>
            )}

            {form.components.map((comp) => (
              <div key={comp.tempId} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  value={comp.name}
                  onChange={(e) => updateComp(comp.tempId, "name", e.target.value)}
                  placeholder={t.compNamePlaceholder}
                  className="flex-[3] px-3 py-2 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none text-sm text-slate-700"
                />
                <input
                  type="number"
                  value={comp.weight}
                  onChange={(e) => updateComp(comp.tempId, "weight", e.target.value)}
                  placeholder="%"
                  min={0}
                  max={100}
                  className="flex-1 min-w-0 px-3 py-2 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none text-sm text-slate-700"
                />
                <input
                  type="number"
                  value={comp.score}
                  onChange={(e) => updateComp(comp.tempId, "score", e.target.value)}
                  placeholder="0-100"
                  min={0}
                  max={100}
                  step={0.1}
                  className="flex-[2] min-w-0 px-3 py-2 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none text-sm text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => removeComp(comp.tempId)}
                  className="w-8 p-1.5 text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addComponent}
              className="text-sm font-semibold text-[#a57b5a] hover:text-[#4a3728] transition-colors"
            >
              {t.addComponent}
            </button>
          </div>

          {error && (
            <p className="text-sm text-rose-500 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          {/* Save / Cancel */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl font-semibold border border-[#e6beae] text-[#4a3728] hover:bg-[#f5ede4] transition-all"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-2xl font-bold bg-[#a57b5a] hover:bg-[#8e684a] text-white shadow-md transition-all disabled:opacity-60"
            >
              {saving ? "…" : t.save}
            </button>
          </div>

          {/* Delete */}
          {isEdit && (
            <div className="border-t border-[#e6beae]/40 pt-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-50 border border-rose-100 transition-all flex items-center justify-center gap-2"
                >
                  <TrashIcon /> {t.deleteCourse}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-semibold border border-[#e6beae] text-[#4a3728] hover:bg-[#f5ede4] transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-2xl text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all disabled:opacity-60"
                  >
                    {t.deleteCourse}
                  </button>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── GradeCard ────────────────────────────────────────────────────────────────
function GradeCard({ grade, language, onEdit }) {
  const t = translations[language];
  const [expanded, setExpanded] = useState(false);
  const colors = scoreColors(grade.finalScore);

  return (
    <div className="bg-white rounded-2xl border border-[#e6beae]/30 shadow-sm hover:shadow-md transition-all">
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Score badge */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-xl shadow-sm"
          style={{ background: colors.bg, color: colors.text }}
        >
          {grade.finalScore != null ? grade.finalScore.toFixed(0) : "—"}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="flex-1 font-bold text-[#4a3728] text-sm leading-snug truncate">
              {grade.courseName}
            </h3>
            <button
              onClick={() => onEdit(grade)}
              className="p-1.5 text-[#a57b5a]/40 hover:text-[#a57b5a] hover:bg-[#f5ede4] rounded-lg transition-all shrink-0"
            >
              <EditIcon />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-[#a57b5a] bg-[#f5ede4] px-2 py-0.5 rounded-full">
              {grade.credits} {t.credits}
            </span>
            {grade.semester && (
              <span className="text-xs text-slate-500 font-medium">
                {semLabel(grade.semester, t)}
              </span>
            )}
            {grade.year && (
              <span className="text-xs text-slate-400">{grade.year}</span>
            )}
          </div>
        </div>
      </div>

      {/* Component breakdown toggle */}
      {grade.components?.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 pb-3 flex items-center gap-1.5 text-xs font-semibold text-[#a57b5a]/60 hover:text-[#a57b5a] transition-colors"
          >
            {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {expanded ? t.hideBreakdown : t.showBreakdown}
            <span className="text-slate-400 ms-0.5">({grade.components.length})</span>
          </button>

          {expanded && (
            <div className="px-5 pb-4 border-t border-[#e6beae]/20">
              <div className="mt-3 flex flex-col gap-2">
                {grade.components.map((comp) => {
                  const cc = scoreColors(comp.score);
                  return (
                    <div key={comp.id} className="flex items-center gap-3">
                      <span className="flex-1 text-xs text-slate-600 font-medium truncate">{comp.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">{comp.weight}%</span>
                      <div
                        className="w-12 text-center text-xs font-bold rounded-lg py-0.5 shrink-0"
                        style={{ background: cc.bg, color: cc.text }}
                      >
                        {comp.score != null ? comp.score : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── PredictPanel ─────────────────────────────────────────────────────────────
function PredictPanel({ language, token }) {
  const t = translations[language];
  const [target, setTarget] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const calculate = async () => {
    if (!target || isNaN(Number(target))) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API}/predict`, { targetAverage: Number(target) }, authHeader);
      setResult(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.message === "noCourses") {
      return <p className="text-sm text-slate-400 italic">{t.noCourses}</p>;
    }
    if (result.message === "allGraded") {
      return (
        <p className="text-sm font-semibold text-emerald-600">{t.allGraded}</p>
      );
    }
    if (result.requiredScore == null) {
      return (
        <p className="text-sm font-semibold text-emerald-600">{t.alreadyAchieved}</p>
      );
    }
    if (result.requiredScore > 100) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-rose-500">{t.unachievable}</p>
          {result.currentAverage != null && (
            <p className="text-xs text-slate-500">
              {t.currentAvg}: <b>{result.currentAverage.toFixed(1)}</b>
            </p>
          )}
        </div>
      );
    }

    const colors = scoreColors(result.requiredScore);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0"
            style={colors}
          >
            {result.requiredScore.toFixed(1)}
          </div>
          <div>
            <p className="text-xs font-bold text-[#a57b5a] uppercase tracking-wide">{t.requiredScore}</p>
            {result.currentAverage != null && (
              <p className="text-xs text-slate-500 mt-0.5">
                {t.currentAvg}: <b>{result.currentAverage.toFixed(1)}</b>
              </p>
            )}
          </div>
        </div>
        {result.ungradedCourses?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1.5">{t.ungradedCourses}:</p>
            <div className="flex flex-wrap gap-1.5">
              {result.ungradedCourses.map((name, i) => (
                <span
                  key={i}
                  className="text-xs bg-[#f5ede4] text-[#4a3728] px-2.5 py-0.5 rounded-full font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e6beae]/30 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#4a3728] flex items-center justify-center text-[#e7d8c9] shrink-0">
          <CalcIcon />
        </div>
        <div>
          <h3 className="font-bold text-[#4a3728] text-sm">{t.predictor}</h3>
          <p className="text-xs text-slate-400">{t.predictorDesc}</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          placeholder="e.g. 85"
          min={0}
          max={100}
          step={0.1}
          className="flex-1 px-3 py-2 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none text-sm text-slate-700"
        />
        <button
          onClick={calculate}
          disabled={loading || !target}
          className="px-5 py-2 rounded-xl font-bold bg-[#a57b5a] hover:bg-[#8e684a] text-white text-sm transition-all disabled:opacity-60 shrink-0"
        >
          {loading ? "…" : t.calculate}
        </button>
      </div>
      {renderResult()}
    </div>
  );
}

// ── GradesPage ───────────────────────────────────────────────────────────────
export default function GradesPage({ language, token }) {
  const t = translations[language];
  const isRTL = language === "he";

  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState({ average: null, totalCredits: 0, gradedCredits: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGrade, setEditGrade] = useState(null);
  const [semFilter, setSemFilter] = useState("all");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchAll = async () => {
    try {
      const [gradesRes, avgRes] = await Promise.all([
        axios.get(API, authHeader),
        axios.get(`${API}/average`, authHeader),
      ]);
      setGrades(gradesRes.data);
      setStats(avgRes.data);
    } catch (err) {
      console.error("Grades fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const semesterOptions = useMemo(
    () => [...new Set(grades.map((g) => g.semester).filter(Boolean))].sort(),
    [grades]
  );

  const filtered = useMemo(
    () => semFilter === "all" ? grades : grades.filter((g) => g.semester === semFilter),
    [grades, semFilter]
  );

  const openAdd = () => { setEditGrade(null); setShowModal(true); };
  const openEdit = (g) => { setEditGrade(g); setShowModal(true); };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#e7d8c9] border-t-[#a57b5a] animate-spin" />
          <p className="text-[#4a3728] font-semibold">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-6 md:py-10 px-4 md:px-6"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-2xl md:text-4xl font-extrabold text-[#4a3728] tracking-tight drop-shadow-sm">
          {t.title}
        </h1>
        <button
          onClick={openAdd}
          className="bg-[#a57b5a] hover:bg-[#8e684a] text-white font-bold px-4 py-2.5 rounded-2xl shadow-md active:scale-[0.98] transition-all text-sm"
        >
          {t.addCourse}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#4a3728] rounded-2xl p-4 shadow-lg text-center col-span-1">
          <p className="text-[#e7d8c9]/50 text-[10px] font-bold uppercase tracking-wider mb-1">{t.weightedAvg}</p>
          <p className="text-3xl font-extrabold text-[#e7d8c9]">
            {stats.average != null ? stats.average.toFixed(1) : "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6beae]/30 text-center">
          <p className="text-[#a57b5a] text-[10px] font-bold uppercase tracking-wider mb-1">{t.gradedCredits}</p>
          <p className="text-2xl font-extrabold text-[#4a3728]">{stats.gradedCredits}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6beae]/30 text-center">
          <p className="text-[#a57b5a] text-[10px] font-bold uppercase tracking-wider mb-1">{t.totalCredits}</p>
          <p className="text-2xl font-extrabold text-[#4a3728]">{stats.totalCredits}</p>
        </div>
      </div>

      {/* Semester filter */}
      {semesterOptions.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-5">
          <button
            onClick={() => setSemFilter("all")}
            className={`px-4 py-1.5 rounded-xl font-semibold text-sm transition-all ${
              semFilter === "all"
                ? "bg-[#4a3728] text-[#e7d8c9]"
                : "bg-white/70 text-[#4a3728]/60 hover:bg-white hover:text-[#4a3728]"
            }`}
          >
            {t.allSemesters}
          </button>
          {semesterOptions.map((s) => (
            <button
              key={s}
              onClick={() => setSemFilter(s)}
              className={`px-4 py-1.5 rounded-xl font-semibold text-sm transition-all ${
                semFilter === s
                  ? "bg-[#a57b5a] text-white"
                  : "bg-white/70 text-[#4a3728]/60 hover:bg-white hover:text-[#4a3728]"
              }`}
            >
              {semLabel(s, t)}
            </button>
          ))}
        </div>
      )}

      {/* Grade list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#a57b5a]/50 text-lg font-semibold">{t.noGrades}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {filtered.map((g) => (
            <GradeCard key={g.id} grade={g} language={language} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Predictor */}
      <PredictPanel language={language} token={token} />

      {/* Modal */}
      {showModal && (
        <GradeModal
          language={language}
          grade={editGrade}
          onClose={() => setShowModal(false)}
          onSaved={fetchAll}
          token={token}
        />
      )}
    </div>
  );
}
