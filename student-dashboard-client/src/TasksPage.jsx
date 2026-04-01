import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "./apiConfig";

const API = `${API_BASE}/Tasks`;
const CATEGORIES = ["Studies", "Personal", "Work"];

const translations = {
  en: {
    title: "My Tasks",
    addButton: "Add Task",
    editTitle: "Edit Task",
    placeholderTitle: "Task title...",
    placeholderDesc: "Description...",
    save: "Save Task",
    cancel: "Cancel",
    empty: "No tasks here!",
    due: "Due:",
    filterAll: "All",
    filterInProgress: "In Progress",
    filterCompleted: "Completed",
    sortLabel: "Sort:",
    sortByDate: "By Due Date",
    sortByPriority: "By Priority",
    priority: "Priority",
    category: "Category",
    low: "Low",
    medium: "Medium",
    high: "High",
    studies: "Studies",
    personal: "Personal",
    work: "Work",
    loading: "Loading data...",
  },
  he: {
    title: "המשימות שלי",
    addButton: "הוספת משימה",
    editTitle: "עריכת משימה",
    placeholderTitle: "כותרת המשימה...",
    placeholderDesc: "תיאור...",
    save: "שמור משימה",
    cancel: "ביטול",
    empty: "אין משימות כאן!",
    due: "יעד:",
    filterAll: "הכל",
    filterInProgress: "בתהליך",
    filterCompleted: "הושלם",
    sortLabel: "מיון:",
    sortByDate: "לפי תאריך",
    sortByPriority: "לפי עדיפות",
    priority: "עדיפות",
    category: "קטגוריה",
    low: "נמוך",
    medium: "בינוני",
    high: "גבוה",
    studies: "לימודים",
    personal: "אישי",
    work: "עבודה",
    loading: "...נתונים נטענים",
  },
};

const COLUMN_CONFIG = {
  Studies: { accent: "#8b7355", bg: "#f5ede4", border: "#d4c4b0" },
  Personal: { accent: "#a07862", bg: "#faf0ea", border: "#dcc8b8" },
  Work: { accent: "#6b5b4e", bg: "#f0e8df", border: "#c9b9a8" },
};

const PRIORITY_BADGE = {
  0: { bg: "#e8f5e8", text: "#3a7a3a" },
  1: { bg: "#fff8e1", text: "#9a6c00" },
  2: { bg: "#fdecea", text: "#9a3333" },
};

function getCategoryLabel(category, t) {
  if (category === "Studies") return t.studies;
  if (category === "Personal") return t.personal;
  return t.work;
}

function getPriorityLabel(priority, t) {
  if (priority === 0) return t.low;
  if (priority === 2) return t.high;
  return t.medium;
}

// ─── TaskForm Modal ────────────────────────────────────────────────────────────
function TaskForm({ language, task, onClose, onSaved, token }) {
  const t = translations[language];
  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [date, setDate] = useState(
    task?.dueDate ? task.dueDate.split("T")[0] : "",
  );
  const [priority, setPriority] = useState(task?.priority ?? 1);
  const [category, setCategory] = useState(task?.category ?? "Studies");
  const [saving, setSaving] = useState(false);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        id: task?.id ?? 0,
        title,
        description,
        dueDate: date ? new Date(date).toISOString() : new Date().toISOString(),
        isCompleted: task?.isCompleted ?? false,
        priority: Number(priority),
        category,
      };
      if (isEdit) {
        await axios.put(`${API}/${task.id}`, payload, authHeader);
      } else {
        await axios.post(API, payload, authHeader);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving task:", err.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-[#eee4e1] border border-[#e6beae]/50 rounded-xl focus:ring-2 focus:ring-[#a57b5a] outline-none transition-all text-slate-700 placeholder:text-slate-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-5 md:p-8 border border-[#e6beae]/30 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-extrabold text-[#4a3728] mb-6">
          {isEdit ? t.editTitle : t.addButton}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.placeholderTitle}
            className={inputClass + " font-semibold"}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.placeholderDesc}
            className={inputClass + " h-24 resize-none"}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#4a3728]/60 uppercase tracking-wider mb-1.5 block">
                {t.priority}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputClass}
              >
                <option value={0}>{t.low}</option>
                <option value={1}>{t.medium}</option>
                <option value={2}>{t.high}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#4a3728]/60 uppercase tracking-wider mb-1.5 block">
                {t.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                <option value="Studies">{t.studies}</option>
                <option value="Personal">{t.personal}</option>
                <option value="Work">{t.work}</option>
              </select>
            </div>
          </div>
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

// ─── TaskCard ─────────────────────────────────────────────────────────────────
function TaskCard({ task, language, onEdit, onDelete, onToggle }) {
  const t = translations[language];
  const badge = PRIORITY_BADGE[task.priority ?? 1];

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all group cursor-pointer"
      onClick={() => onEdit(task)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className={`font-bold text-sm leading-snug flex-1 ${
            task.isCompleted ? "line-through text-slate-400" : "text-[#4a3728]"
          }`}
        >
          {task.title}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-slate-300 hover:text-rose-400 transition-all shrink-0 rounded p-0.5"
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {task.dueDate && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#a57b5a]">
            {t.due}{" "}
            {new Date(task.dueDate).toLocaleDateString(
              language === "he" ? "he-IL" : "en-GB",
            )}
          </span>
        )}
        <span
          className="ms-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: badge.bg, color: badge.text }}
        >
          {getPriorityLabel(task.priority ?? 1, t)}
        </span>
      </div>

      {/* Toggle button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task);
        }}
        className={`mt-2.5 text-[10px] font-semibold px-3 py-1 rounded-full border transition-all ${
          task.isCompleted
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
        }`}
      >
        {task.isCompleted ? `✓ ${t.filterCompleted}` : t.filterInProgress}
      </button>
    </div>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────
function KanbanColumn({
  category,
  tasks,
  language,
  onEdit,
  onDelete,
  onToggle,
}) {
  const t = translations[language];
  const cfg = COLUMN_CONFIG[category];
  const label = getCategoryLabel(category, t);

  return (
    <div
      className="rounded-2xl flex flex-col min-h-[420px]"
      style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}` }}
    >
      {/* Header */}
      <div
        className="rounded-t-2xl px-5 py-4 flex items-center justify-between"
        style={{ background: cfg.accent }}
      >
        <h2 className="text-white font-extrabold text-base tracking-wide">
          {label}
        </h2>
        <span className="bg-white/25 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            language={language}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8">
            <p
              className="text-sm italic font-medium"
              style={{ color: cfg.accent + "88" }}
            >
              {t.empty}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TasksPage ────────────────────────────────────────────────────────────────
export default function TasksPage({ language, token }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("all"); // all | inProgress | completed
  const [sort, setSort] = useState("date"); // date | priority

  const t = translations[language];
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API, authHeader);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/${id}`, authHeader);
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API}/${task.id}`, {
        ...task,
        isCompleted: !task.isCompleted,
      }, authHeader);
      fetchTasks();
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAdd = () => {
    setEditTask(null);
    setShowModal(true);
  };
  const openEdit = (task) => {
    setEditTask(task);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // Filter
  const filtered = tasks.filter((task) => {
    if (filter === "inProgress") return !task.isCompleted;
    if (filter === "completed") return task.isCompleted;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "priority") return (b.priority ?? 1) - (a.priority ?? 1);
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const colTasks = (cat) =>
    sorted.filter((task) => (task.category ?? "Studies") === cat);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5">
        <div className="w-14 h-14 rounded-full border-4 border-[#e7d8c9] border-t-[#a57b5a] animate-spin" />
        <p className="text-[#4a3728] font-semibold text-lg tracking-wide">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="py-6 md:py-10 px-4 md:px-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-7 flex-wrap">
        <h1 className="text-2xl md:text-4xl font-extrabold text-[#4a3728] tracking-tight drop-shadow-sm">
          {t.title}
        </h1>
        <button
          onClick={openAdd}
          className="bg-[#a57b5a] hover:bg-[#8e684a] text-white font-bold px-4 md:px-5 py-2.5 rounded-2xl shadow-md active:scale-[0.98] transition-all text-sm md:text-base"
        >
          + {t.addButton}
        </button>
      </div>

      {/* Toolbar: filters + sort */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Filter buttons */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: t.filterAll },
            { key: "inProgress", label: t.filterInProgress },
            { key: "completed", label: t.filterCompleted },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === key
                  ? "bg-[#a57b5a] text-white shadow-sm"
                  : "bg-white/60 text-[#4a3728]/70 hover:bg-white hover:text-[#4a3728]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 ms-auto">
          <span className="text-sm font-semibold text-[#4a3728]/60">
            {t.sortLabel}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/70 border border-[#e6beae]/60 text-sm font-semibold text-[#4a3728] focus:outline-none focus:ring-2 focus:ring-[#a57b5a]"
          >
            <option value="date">{t.sortByDate}</option>
            <option value="priority">{t.sortByPriority}</option>
          </select>
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CATEGORIES.map((cat) => (
          <KanbanColumn
            key={cat}
            category={cat}
            tasks={colTasks(cat)}
            language={language}
            onEdit={openEdit}
            onDelete={deleteTask}
            onToggle={toggleComplete}
          />
        ))}
      </div>

      {showModal && (
        <TaskForm
          language={language}
          task={editTask}
          onClose={closeModal}
          onSaved={fetchTasks}
          token={token}
        />
      )}
    </div>
  );
}
