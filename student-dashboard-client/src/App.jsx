import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const fetchTasks = async () => {
    try {
      const response = await axios.get("https://localhost:7137/api/Tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const taskData = {
      id: 0,
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: new Date().toISOString(),
      isCompleted: false,
    };
    try {
      await axios.post("https://localhost:7137/api/Tasks", taskData);
      setNewTaskTitle("");
      setNewTaskDescription("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error.response?.data);
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
    const updatedTask = {
      ...task,
      isCompleted: !task.isCompleted,
    };

    try {
      await axios.put(
        `https://localhost:7137/api/Tasks/${task.id}`,
        updatedTask,
      );
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div
      className="min-h-screen bg-[#eee4e1] font-sans text-slate-800 py-12 px-4"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-[#4a3728] tracking-tight mb-2 drop-shadow-sm">
            My Tasks
          </h1>
          <p className="text-slate-500 font-medium italic">Student Dashboard</p>
        </header>

        <div className="bg-[#e7d8c9] rounded-3xl shadow-lg p-8 mb-10 border border-[#e6beae]/20">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-[#e6beae] outline-none transition-all placeholder:text-slate-400 font-semibold"
            />

            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description..."
              className="w-full px-5 py-4 bg-white/50 border-none rounded-2xl focus:ring-2 focus:ring-[#e6beae] outline-none transition-all h-24 resize-none"
            />

            <button
              onClick={addTask}
              className="w-full bg-[#a57b5a] hover:bg-[#d4ac9c] text-white font-bold py-4 rounded-2xl shadow-md transform active:scale-[0.98] transition-all"
            >
              Add Task
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-6 bg-[#e7d8c9] rounded-2xl shadow-sm border border-white/30 hover:shadow-md transition-all"
            >
              <div
                className="flex flex-col gap-1 cursor-pointer flex-grow"
                onClick={() => toggleComplete(task)}
              >
                <span
                  className={`text-lg font-bold ${
                    task.isCompleted
                      ? "text-slate-400 line-through"
                      : "text-[#4a3728]"
                  }`}
                >
                  {task.title}
                </span>
                <p className="text-slate-500 text-sm">{task.description}</p>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-400 hover:text-rose-400 transition-colors mr-4"
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
        </div>
      </div>
    </div>
  );
}

export default App;
