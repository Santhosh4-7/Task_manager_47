import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.modules.css';
import { useLocation } from 'react-router-dom';
import useFetchTasks from './useFetchTasks';

function Home() {
  const location = useLocation();
  const { email } = location.state || {};

  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [priority, setPriority] = useState('Low');
  const [msg, setMsg] = useState('');

  const { tasks, error, refetch } = useFetchTasks(email);

  // Always update filtered tasks when main tasks list changes
  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

  // Handle new task submission
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTitle.trim() || !newDesc.trim()) {
      setMsg('Please enter both title and description.');
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

      setMsg('New task added!');
      setNewTitle('');
      setNewDesc('');
      setPriority('Low');
      await refetch(); // Refresh the task list
    } catch (err) {
      console.error('Failed to add task:', err);
      setMsg('Something went wrong while adding the task.');
    }
  };

  // Mark task as completed
  const completeTask = async (id) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${id}`, {
        completed: true,
        email,
      });
      await refetch();
    } catch (err) {
      console.warn('Failed to mark task complete:', err);
      setMsg('Could not complete the task.');
    }
  };

  // Delete a task
  const removeTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`, {
        data: { email },
      });
      await refetch();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setMsg('Could not delete the task.');
    }
  };

  // Filter button handlers
  const showCompleted = () => {
    setFilteredTasks(tasks.filter((task) => task.status === 'complete'));
  };

  const showActive = () => {
    setFilteredTasks(tasks.filter((task) => task.status === 'incomplete'));
  };

  const showAll = () => {
    setFilteredTasks(tasks);
  };

  // Sort tasks by priority: High > Medium > Low
  const sortByPriority = (list) => {
    const priorityOrder = ['High', 'Medium', 'Low'];
    return [...list].sort(
      (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    );
  };

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
        <button type="submit">Add Task</button>
      </form>

      {msg && <p className="task-message">{msg}</p>}
      {error && <p className="task-message error">{error}</p>}

      <ul className="task-list">
        {displayTasks.map((task) => (
          <li
            key={task._id}
            className={`task-item ${task.status === 'complete' ? 'completed' : ''}`}
          >
            <div className="task-header">
              <h3>{task.status === 'complete' ? <s>{task.title}</s> : task.title}</h3>
              <span className={`status ${task.status}`}>{task.status}</span>
              <span className="priority">{task.priority}</span>
            </div>
            <p>
              {task.status === 'complete' ? <s>{task.description}</s> : task.description}
            </p>
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
