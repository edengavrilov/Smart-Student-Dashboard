import { useState, useEffect } from "react";
import axios from "axios";

const translations = {
  en: {
    title: "My Tasks",
    addButton: "Add Task",
    placeholderTitle: "Task title...",
    placeholderDesc: "Description...",
    placeholderDate: "Due date",
    save: "Save Task",
    cancel: "Cancel",
    empty: "No tasks yet... time to rest!",
    due: "Due:",
  },
  he: {
    title: "המשימות שלי",
    addButton: "הוספת משימה",
    placeholderTitle: "כותרת המשימה...",
    placeholderDesc: "תיאור...",
    placeholderDate: "תאריך יעד",
    save: "שמור משימה",
    cancel: "ביטול",
    empty: "אין משימות כרגע... זמן לנוח!",
    due: "יעד:",
  },
};

function AddTaskModal({ language, onClose, onSaved }) {
  const t = translations[language];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await axios.post("https://localhost:7137/api/Tasks", {
        id: 0,
        title,
        description,
        dueDate: date ? new Date(date).toISOString() : new Date().toISOString(),
        isCompleted: false,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error adding task:", err.response?.data);
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-[#e6beae]/30">
        <h2 className="text-2xl font-extrabold text-[#4a3728] mb-6">{t.addButton}</h2>
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

export default function TasksPage({ language }) {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const t = translations[language];

  const fetchTasks = async () => {
    try {
      const response = await axios.get("https://localhost:7137/api/Tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`https://localhost:7137/api/Tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`https://localhost:7137/api/Tasks/${task.id}`, {
        ...task,
        isCompleted: !task.isCompleted,
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="py-12 px-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold text-[#4a3728] tracking-tight drop-shadow-sm">
          {t.title}
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#a57b5a] hover:bg-[#8e684a] text-white font-bold px-5 py-2.5 rounded-2xl shadow-md active:scale-[0.98] transition-all"
        >
          + {t.addButton}
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between p-6 bg-[#e7d8c9] rounded-2xl shadow-sm border border-white/30 hover:shadow-md transition-all"
          >
            <div
              className="flex flex-col gap-1 cursor-pointer grow"
              onClick={() => toggleComplete(task)}
            >
              <span
                className={`text-lg font-bold transition-all ${
                  task.isCompleted ? "text-slate-400 line-through" : "text-[#4a3728]"
                }`}
              >
                {task.title}
              </span>
              <p className="text-slate-500 text-sm">{task.description}</p>
              {task.dueDate && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#a57b5a] mt-2 block">
                  {t.due}{" "}
                  {new Date(task.dueDate).toLocaleDateString(
                    language === "he" ? "he-IL" : "en-GB",
                  )}
                </span>
              )}
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-400 hover:text-rose-400 transition-colors ms-4 p-2 rounded-full hover:bg-white/30 shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-16 bg-white/10 rounded-3xl border-2 border-dashed border-[#e6beae]/40">
            <p className="text-[#4a3728]/60 font-medium text-lg italic">{t.empty}</p>
          </div>
        )}
      </div>

      {showModal && (
        <AddTaskModal
          language={language}
          onClose={() => setShowModal(false)}
          onSaved={fetchTasks}
        />
      )}
    </div>
  );
}
