import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "./apiConfig";

const AUTH_BASE = `${API_BASE}/Auth`;

const translations = {
  en: {
    profile: "My Profile",
    student: "Student",
    save: "Save",
    cancel: "Cancel",
    saving: "Saving...",
    fullName: "Full Name",
    email: "Email",
    institution: "Institution",
    studyYear: "Study Year",
    fieldOfStudy: "Field of Study",
    notSet: "Not set",
    changePassword: "Change Password",
    oldPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    updatePassword: "Update Password",
    passwordChanged: "Password changed successfully!",
    passwordMismatch: "New passwords do not match",
    passwordEmpty: "Please fill in all password fields",
    saved: "Saved!",
    year1: "Year 1",
    year2: "Year 2",
    year3: "Year 3",
    year4: "Year 4",
    selectYear: "Select year",
    errorLoad: "Failed to load profile",
    institutionPlaceholder: "e.g. Hebrew University",
    fieldOfStudyPlaceholder: "e.g. Computer Science",
    fullNamePlaceholder: "Your full name",
    emailPlaceholder: "your@email.com",
  },
  he: {
    profile: "הפרופיל שלי",
    student: "סטודנט",
    save: "שמור",
    cancel: "בטל",
    saving: "...שומר",
    fullName: "שם מלא",
    email: "אימייל",
    institution: "מוסד לימודים",
    studyYear: "שנת לימוד",
    fieldOfStudy: "תחום לימוד",
    notSet: "לא הוגדר",
    changePassword: "שינוי סיסמה",
    oldPassword: "סיסמה נוכחית",
    newPassword: "סיסמה חדשה",
    confirmPassword: "אימות סיסמה חדשה",
    updatePassword: "עדכן סיסמה",
    passwordChanged: "!הסיסמה שונתה בהצלחה",
    passwordMismatch: "הסיסמאות החדשות אינן תואמות",
    passwordEmpty: "אנא מלא את כל שדות הסיסמה",
    saved: "!נשמר",
    year1: "שנה א׳",
    year2: "שנה ב׳",
    year3: "שנה ג׳",
    year4: "שנה ד׳",
    selectYear: "בחר שנה",
    errorLoad: "טעינת הפרופיל נכשלה",
    institutionPlaceholder: "למשל: האוניברסיטה העברית",
    fieldOfStudyPlaceholder: "למשל: מדעי המחשב",
    fullNamePlaceholder: "השם המלא שלך",
    emailPlaceholder: "your@email.com",
  },
};

const STUDY_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4"];

const INSTITUTIONS = [
  "Hebrew University of Jerusalem",
  "Tel Aviv University",
  "Technion – Israel Institute of Technology",
  "Bar-Ilan University",
  "Ben-Gurion University of the Negev",
  "University of Haifa",
  "Weizmann Institute of Science",
  "Open University of Israel",
  "Reichman University",
  "Ariel University",
];

const FIELDS_OF_STUDY = [
  "Computer Science", "Software Engineering", "Electrical Engineering",
  "Mechanical Engineering", "Medicine", "Law", "Economics",
  "Business Administration", "Psychology", "Biology", "Chemistry",
  "Physics", "Mathematics", "Education", "Architecture", "Social Work",
  "Nursing", "Pharmacy", "Data Science", "Information Systems",
];

function getInitials(name) {
  if (!name) return "?";
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function ProfilePage({ language, token }) {
  const t = translations[language];
  const isRTL = language === "he";

  const [profile, setProfile] = useState({
    fullName: "", email: "", institution: "", studyYear: "", fieldOfStudy: "",
  });
  const [loadError, setLoadError] = useState("");

  // Per-field inline editing
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldMsg, setFieldMsg] = useState({ field: null, text: "", ok: true });

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState({ text: "", ok: true });
  const [passwordSaving, setPasswordSaving] = useState(false);

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios
      .get(`${AUTH_BASE}/profile`, { headers: authHeader })
      .then((res) => setProfile(res.data))
      .catch(() => setLoadError(t.errorLoad));
  }, []);

  const startEdit = (field) => {
    setEditingField(field);
    setEditValue(profile[field] ?? "");
    setFieldMsg({ field: null, text: "", ok: true });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveField = async (field) => {
    setSaving(true);
    const updated = { ...profile, [field]: editValue };
    try {
      await axios.put(`${AUTH_BASE}/profile`, updated, { headers: authHeader });
      setProfile(updated);
      setEditingField(null);
      setEditValue("");
      setFieldMsg({ field, text: t.saved, ok: true });
      setTimeout(() => setFieldMsg({ field: null, text: "", ok: true }), 2500);
    } catch (err) {
      const data = err.response?.data;
      setFieldMsg({
        field,
        text: typeof data === "string" ? data : data?.title || "Error",
        ok: false,
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: "", ok: true });
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMsg({ text: t.passwordEmpty, ok: false });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ text: t.passwordMismatch, ok: false });
      return;
    }
    setPasswordSaving(true);
    try {
      await axios.put(
        `${AUTH_BASE}/change-password`,
        { oldPassword: passwords.oldPassword, newPassword: passwords.newPassword },
        { headers: authHeader }
      );
      setPasswordMsg({ text: t.passwordChanged, ok: true });
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMsg({ text: "", ok: true });
      }, 2000);
    } catch (err) {
      const data = err.response?.data;
      setPasswordMsg({
        text: typeof data === "string" ? data : data?.title || "Error",
        ok: false,
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordMsg({ text: "", ok: true });
    setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const yearLabel = (y) => {
    const map = { "Year 1": t.year1, "Year 2": t.year2, "Year 3": t.year3, "Year 4": t.year4 };
    return map[y] ?? y;
  };

  const displayValue = (field) => {
    if (field === "studyYear") return profile.studyYear ? yearLabel(profile.studyYear) : "";
    return profile[field] || "";
  };

  const inputClass =
    "flex-1 min-w-0 px-3 py-1.5 bg-[#f5ede4] border border-[#e6beae]/60 rounded-lg focus:ring-2 focus:ring-[#a57b5a] outline-none transition-all text-slate-700 text-sm";

  // Renders a single profile field row (called as a function, not as JSX component)
  const renderField = (field, type = "text") => {
    const isEditing = editingField === field;
    const showMsg = fieldMsg.field === field;
    const value = displayValue(field);

    return (
      <div key={field} className="py-4 border-b border-[#e6beae]/30 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-32 shrink-0 text-xs font-semibold text-[#a57b5a] uppercase tracking-wide">
            {t[field]}
          </span>

          {isEditing ? (
            <>
              {field === "studyYear" ? (
                <select
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={inputClass}
                  autoFocus
                >
                  <option value="">{t.selectYear}</option>
                  {STUDY_YEARS.map((y) => (
                    <option key={y} value={y}>{yearLabel(y)}</option>
                  ))}
                </select>
              ) : field === "institution" ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    list="institution-list"
                    placeholder={t.institutionPlaceholder}
                    className={inputClass}
                    autoFocus
                  />
                  <datalist id="institution-list">
                    {INSTITUTIONS.map((i) => <option key={i} value={i} />)}
                  </datalist>
                </>
              ) : field === "fieldOfStudy" ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    list="field-list"
                    placeholder={t.fieldOfStudyPlaceholder}
                    className={inputClass}
                    autoFocus
                  />
                  <datalist id="field-list">
                    {FIELDS_OF_STUDY.map((f) => <option key={f} value={f} />)}
                  </datalist>
                </>
              ) : (
                <input
                  type={type}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={inputClass}
                  autoFocus
                />
              )}
              <button
                onClick={() => saveField(field)}
                disabled={saving}
                className="p-1.5 rounded-lg bg-[#a57b5a] text-white hover:bg-[#8e684a] transition-all disabled:opacity-50 shrink-0"
                title={t.save}
              >
                <CheckIcon />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded-lg bg-[#e6beae]/40 text-[#4a3728] hover:bg-[#e6beae]/70 transition-all shrink-0"
                title={t.cancel}
              >
                <XIcon />
              </button>
            </>
          ) : (
            <>
              <span className={`flex-1 min-w-0 text-sm font-medium truncate ${value ? "text-slate-700" : "text-slate-400 italic"}`}>
                {value || t.notSet}
              </span>
              {showMsg && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  fieldMsg.ok ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
                }`}>
                  {fieldMsg.text}
                </span>
              )}
              <button
                onClick={() => startEdit(field)}
                className="p-1.5 rounded-lg text-[#a57b5a]/50 hover:text-[#a57b5a] hover:bg-[#f5ede4] transition-all shrink-0"
                title={t.save}
              >
                <PencilIcon />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#eee4e1] p-6 md:p-10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-xl mx-auto flex flex-col gap-6">

        {loadError && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
            {loadError}
          </div>
        )}

        {/* Profile hero card */}
        <div className="bg-[#4a3728] rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-[#a57b5a] flex items-center justify-center shadow-xl ring-4 ring-white/10">
            <span className="text-3xl font-extrabold text-white select-none">
              {getInitials(profile.fullName)}
            </span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#e7d8c9]">
              {profile.fullName || "—"}
            </h1>
            <p className="text-[#e7d8c9]/55 text-sm mt-0.5">{profile.email}</p>
            {(profile.studyYear || profile.fieldOfStudy || profile.institution) && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {profile.studyYear && (
                  <span className="px-3 py-0.5 rounded-full bg-[#a57b5a]/40 text-[#e7d8c9] text-xs font-semibold">
                    {yearLabel(profile.studyYear)}
                  </span>
                )}
                {profile.fieldOfStudy && (
                  <span className="px-3 py-0.5 rounded-full bg-white/10 text-[#e7d8c9] text-xs font-semibold">
                    {profile.fieldOfStudy}
                  </span>
                )}
                {profile.institution && (
                  <span className="px-3 py-0.5 rounded-full bg-white/10 text-[#e7d8c9] text-xs font-semibold">
                    {profile.institution}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail rows card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#e6beae]/30 px-6 py-1">
          {renderField("fullName", "text")}
          {renderField("email", "email")}
          {renderField("institution")}
          {renderField("studyYear")}
          {renderField("fieldOfStudy")}
        </div>

        {/* Change password button */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center gap-2.5 self-start px-5 py-3 rounded-2xl font-bold bg-[#4a3728] hover:bg-[#3a2a1e] text-[#e7d8c9] shadow-md active:scale-[0.98] transition-all"
        >
          <LockIcon />
          {t.changePassword}
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closePasswordModal(); }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-[#e6beae]/30 p-7 w-full max-w-sm"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Modal header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#4a3728] flex items-center justify-center shrink-0">
                <LockIcon />
              </div>
              <h2 className="text-lg font-bold text-[#4a3728]">{t.changePassword}</h2>
            </div>

            <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
              {[
                { key: "oldPassword", label: t.oldPassword },
                { key: "newPassword", label: t.newPassword },
                { key: "confirmPassword", label: t.confirmPassword },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-[#4a3728] mb-1.5">
                    {label}
                  </label>
                  <input
                    type="password"
                    value={passwords[key]}
                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f5ede4] border border-[#e6beae]/60 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none transition-all text-slate-700"
                  />
                </div>
              ))}

              {passwordMsg.text && (
                <p className={`text-sm font-medium px-3 py-2 rounded-xl border ${
                  passwordMsg.ok
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-100 text-rose-500"
                }`}>
                  {passwordMsg.text}
                </p>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 py-3 rounded-2xl font-bold bg-[#a57b5a] hover:bg-[#8e684a] text-white shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {passwordSaving ? t.saving : t.updatePassword}
                </button>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-5 py-3 rounded-2xl font-bold bg-[#e6beae]/40 hover:bg-[#e6beae]/70 text-[#4a3728] transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
