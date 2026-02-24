import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [tasks, setTasks] = useState([]) // כאן נשמור את המשימות שיגיעו מהשרת

  // הפונקציה הזו פונה ל-API ומביאה את הנתונים
  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://localhost:7137/api/Tasks')
      setTasks(response.data) // מעדכנים את ה-State עם המשימות מה-DB
    } catch (error) {
      console.error("יש בעיה בחיבור לשרת:", error)
    }
  }

  // useEffect דואג שהפונקציה תרוץ מיד כשהדף נפתח
  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div style={{ direction: 'rtl', padding: '20px' }}>
      <h1>רשימת המשימות שלי מה-API</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <strong>{task.title}</strong> - {task.isCompleted ? '✅' : '❌'}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App