import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './home.modules.css'; // Updated CSS import
import { useLocation } from 'react-router-dom';

function Home() {
  const [allTasks, setAllTasks] = useState([]); // Store ALL tasks
  const [tasks, setTasks] = useState([]); // Tasks currently displayed
  const [newTask, setNewTask] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('Low');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const { email } = location.state || {};

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks', {
        params: { email }
      });
      setAllTasks(response.data); // Save full list
      setTasks(response.data); // Also show all tasks initially
    } catch (error) {
      setMessage('Error fetching tasks');
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask || !taskDescription) {
      setMessage('Both title and description are required');
      return;
    }

    try {
      await axios.post('http://localhost:5000/tasks', {
        title: newTask,
        completed: false,
        email,
        description: taskDescription,
        priority: taskPriority,
      });
      setMessage('Task added successfully');
      setNewTask('');
      setTaskDescription('');
      setTaskPriority('Low');
      fetchTasks(); // Refresh full list
    } catch (error) {
      setMessage('Error adding task');
    }
  };

  const toggleComplete = async (taskId) => {
    try {
      await axios.put(
        `http://localhost:5000/tasks/${taskId}`,
        { email, completed: true }
      );
      fetchTasks();
    } catch (error) {
      setMessage('Error updating task status');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(
        `http://localhost:5000/tasks/${taskId}`,
        { data: { email } }
      );
      fetchTasks();
    } catch (error) {
      setMessage('Error deleting task');
    }
  };

  const showCompletedTasks = () => {
    const completedTasks = allTasks.filter((task) => task.status === 'complete');
    setTasks(completedTasks);
  };

  const showActiveTasks = () => {
    const activeTasks = allTasks.filter((task) => task.status === 'incomplete');
    setTasks(activeTasks);
  };

  const showAllTasks = () => {
    setTasks(allTasks); // Just reset to full list
  };

  const sortTasksByPriority = (tasks) => {
    const priorityOrder = ['High', 'Medium', 'Low'];
    return tasks.slice().sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  };

  useEffect(() => {
    if (email) {
      fetchTasks();
    }
  }, [email]);

  const sortedTasks = sortTasksByPriority(tasks);

  return (
    <div className="task-home-container">
      <h2>Your Tasks</h2>

      <div className="task-filter">
        <button onClick={showAllTasks}>All</button>
        <button onClick={showActiveTasks}>Active</button>
        <button onClick={showCompletedTasks}>Completed</button>
      </div>

      <form onSubmit={addTask} className="task-form">
        <input 
          type="text" 
          placeholder="Add a new task" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)}
        />
        <textarea
          placeholder="Add a task description"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
        />
        <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      {message && <p className="task-message">{message}</p>}

      <ul className="task-list">
        {sortedTasks.map((task) => (
          <li key={task._id} className={`task-item ${task.status === 'complete' ? 'completed' : ''}`}>
            <div className="task-header">
              {task.status === 'complete' ? (
                <h3><s>{task.title}</s></h3>
              ) : (
                <h3>{task.title}</h3>
              )}
              <span className={`status ${task.status === 'complete' ? 'completed' : 'active'}`}>
                {task.status === 'complete' ? 'Completed' : 'Active'}
              </span>
              <span className="priority">{task.priority}</span>
            </div>
            {task.status === 'complete' ? (
              <p><s>{task.description}</s></p>
            ) : (
              <p>{task.description}</p>
            )}
            <div className="task-actions">
              {task.status === 'incomplete' && (
                <button onClick={() => toggleComplete(task._id)}>Mark as Complete</button>
              )}
              <button onClick={() => deleteTask(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
