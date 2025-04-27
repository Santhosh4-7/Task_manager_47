// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const TaskManager = require('./models/user');
const cors = require('cors');

// Create an express app
const app = express();
const crypto = require('crypto');

const jwt = require('jsonwebtoken')
 
app.use(cors());  
// Middleware to parse JSON data
app.use(express.json());


// Run function to register user with tasks

// MongoDB connection string
const dbURI = 'mongodb://localhost:27017/Taskmanager'; // Replace with your actual MongoDB connection string

// MongoDB connection setup
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Simple Home Route
app.get('/', (req, res) => {
  res.send('Task Manager Backend Running');
});

var bcrypt = require('bcrypt');

bcrypt.hash('mypassword', 10, function(err, hash) {
    if (err) { throw (err); }

    bcrypt.compare('mypassword', hash, function(err, result) {
        if (err) { throw (err); }
        console.log(result);
    });
});

const JWT_SECRET = '123'; // put any strong secret key here
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Register



 // Replace with your secret key

// Register Route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Check if user already exists
    const existingUser = await TaskManager.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create new user with hashed password
    const newUser = new TaskManager({ email, password: hashedPassword });
    await newUser.save();

    // Create JWT Token
    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await TaskManager.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'User not found', 
        errorType: 'UserNotFound'
      });
    }

    // Compare the provided plain text password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid credentials', 
        errorType: 'WrongPassword'
      });
    }

    // Create JWT Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      message: 'Server error during login',
      error: err.message 
    });
  }
});




// Route to Create a Task
// Fetch tasks by email
app.get('/tasks',async (req, res) => {
    const { email } = req.query; // Get email from the query parameter

  try {
    // Fetch the user with the given email
    const user = await TaskManager.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the user's tasks to the console
    

    // Send only the tasks array back in the response
    res.json(user.tasks); 
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});
  
  
  // Add a new task
  app.post('/tasks', async (req, res) => {
    const { title, completed, email, description, priority } = req.body;
  
    // Ensure that all necessary fields are provided
    if (!email || !title || !priority) {
      return res.status(400).json({ error: 'Email, title, and priority are required' });
    }
  
    try {
      // Find the user by email
      const user = await TaskManager.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Create a new task with the description, priority, and other details
      const newTask = { 
        title, 
        completed, 
        description,  // Store the description
        priority,     // Store the priority
        createdAt: new Date() 
      };
  
      // Add the new task to the user's tasks array
      user.tasks.push(newTask);
  
      // Save the updated user document
      await user.save();
      
      res.status(201).json(newTask); // Return the newly added task
    } catch (error) {
      console.error('Error saving task:', error);
      res.status(500).json({ error: error.message });
    }
});
  
    // Send only the tasks array back in the response
    app.put('/tasks/:taskId', async (req, res) => {
      console.log("HEllo")
      const { taskId } = req.params;
      const { email } = req.body;
      let status = "complete";
      try {
        const updatedUser = await TaskManager.findOneAndUpdate(
          { email, 'tasks._id': taskId },          // Find user and task
          { $set: { 'tasks.$.status': status } },   // Update the task's status
          { new: true }
        );
        
        if (!updatedUser) {
          return res.status(404).json({ message: 'User or Task not found' });
        }
    
        const updatedTask = updatedUser.tasks.find(task => task._id.toString() === taskId);
        console.log("upt"+updatedTask);
        res.status(200).json({ message: 'Task status updated', updatedTask });
      } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });
  
  
  
  // Delete a task
  app.delete('/tasks/:taskId', async (req, res) => {
    console.log("Delete Task Called");
    const { taskId } = req.params;
    const { email } = req.body;
  
    try {
      const updatedUser = await TaskManager.findOneAndUpdate(
        { email },                                 // Find user by email
        { $pull: { tasks: { _id: taskId } } },      // Pull (remove) task with matching _id
        { new: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const deletedTask = !updatedUser.tasks.some(task => task._id.toString() === taskId);
  
      if (deletedTask) {
        res.status(200).json({ message: 'Task deleted successfully' });
      } else {
        res.status(404).json({ message: 'Task not found' });
      }
  
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
// Start the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
