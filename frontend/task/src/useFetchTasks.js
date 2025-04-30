import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
this hook is called when you have to fetch data.
This runs everytime you manually login to your account or add,delete a task
 */
const useFetchTasks = (email) => {
  const [tasks, setTasks] = useState([]);       // Store the list of tasks
  const [error, setError] = useState('');       // Store any error message

  // Function to fetch tasks from the server
  const fetchTasks = useCallback(async () => {
    if (!email) return; // Don't run if email is not available

    try {
      const response = await axios.get('http://localhost:5000/tasks', {
        params: { email },
      });

      setTasks(response.data);  // Set the fetched tasks
      setError('');             // Clear any previous error
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not load tasks. Please try again.');
    }
  }, [email]);

  // Automatically fetch tasks when email becomes available or changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Return the tasks, any error, and a manual refetch function
  return {
    tasks,
    error,
    refetch: fetchTasks,
  };
};

export default useFetchTasks;
