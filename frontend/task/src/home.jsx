import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.modules.css';
import { useLocation } from 'react-router-dom';

function Home() {
  const [taskList, setTaskList] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [priority, setPriority] = useState('Low');
  const [msg, setMsg] = useState('');
  const location = useLocation();
  const { email } = location.state || {};

  // Get tasks from server
  const loadTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/tasks', {
        params: { email },
      });
      setTaskList(res.data);
      setFilteredTasks(res.data);
    } catch (err) {
      console.error('Could not fetch tasks:', err);
      setMsg('Failed to load tasks');
    }
  };

  // Add a task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      setMsg('Title and description required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/tasks', {
        title: newTitle,
        description: newDesc,
        priority,
        completed: false,
        email,
      });
      setMsg('Task added!');
      setNewTitle('');
      setNewDesc('');
      setPriority('Low');
      loadTasks();
    } catch (err) {
      console.error('Add error:', err);
      setMsg('Could not add task');
    }
  };

  // Mark task as complete
  const completeTask = async (id) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${id}`, {
        completed: true,
        email,
      });
      loadTasks();
    } catch (err) {
      console.warn('Completion failed');
      setMsg('Failed to update task');
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`, {
        data: { email },
      });
      loadTasks();
    } catch (err) {
      setMsg('Error deleting');
    }
  };

  // Filters
  const showCompleted = () => {
    setFilteredTasks(taskList.filter((t) => t.status === 'complete'));
  };

  const showActive = () => {
    setFilteredTasks(taskList.filter((t) => t.status === 'incomplete'));
  };

  const showAll = () => {
    setFilteredTasks(taskList);
  };

  // Simple sorting
  const sortByPriority = (items) => {
    const order = ['High', 'Medium', 'Low'];
    return [...items].sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority));
  };

  useEffect(() => {
    if (email) {
      loadTasks();
    }
  }, [email]);

  const displayTasks = sortByPriority(filteredTasks);

  return (
    <div className="task-home-container">
      <h2>Welcome! Here are your tasks:</h2>

      <div className="task-filter">
        <button onClick={showAll}>All</button>
        <button onClick={showActive}>Active</button>
        <button onClick={showCompleted}>Completed</button>
      </div>

      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          placeholder="Task title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Add</button>
      </form>

      {msg && <p className="task-message">{msg}</p>}

      <ul className="task-list">
        {displayTasks.map((task) => (
          <li key={task._id} className={`task-item ${task.status === 'complete' ? 'completed' : ''}`}>
            <div className="task-header">
              <h3>{task.status === 'complete' ? <s>{task.title}</s> : task.title}</h3>
              <span className={`status ${task.status}`}>{task.status}</span>
              <span className="priority">{task.priority}</span>
            </div>
            <p>{task.status === 'complete' ? <s>{task.description}</s> : task.description}</p>
            <div className="task-actions">
              {task.status === 'incomplete' && (
                <button onClick={() => completeTask(task._id)}>Complete</button>
              )}
              <button onClick={() => removeTask(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
        
