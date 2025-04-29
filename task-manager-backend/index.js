const express = require('express');
const mongoose = require('mongoose');
const TaskManager = require('./models/user');
const cors = require('cors');
const app = express();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());

const dbURI = 'mongodb://localhost:27017/Taskmanager';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB!'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.get('/', (req, res) => {
  res.send('Task Manager Backend Running');
});

bcrypt.hash('mypassword', 10, function(err, hash) {
  if (err) { throw (err); }
  bcrypt.compare('mypassword', hash, function(err, result) {
    if (err) { throw (err); }
    console.log(result);
  });
});

const JWT_SECRET = '123';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const existingUser = await TaskManager.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new TaskManager({ email, password: hashedPassword });
    await newUser.save();

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

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await TaskManager.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found', errorType: 'UserNotFound' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials', errorType: 'WrongPassword' });
    }

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
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

app.get('/tasks', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await TaskManager.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, completed, email, description, priority } = req.body;
  if (!email || !title || !priority) {
    return res.status(400).json({ error: 'Email, title, and priority are required' });
  }

  try {
    const user = await TaskManager.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newTask = {
      title,
      completed,
      description,
      priority,
      createdAt: new Date()
    };

    user.tasks.push(newTask);
    await user.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/tasks/:taskId', async (req, res) => {
  console.log("HEllo")
  const { taskId } = req.params;
  const { email } = req.body;
  let status = "complete";
  try {
    const updatedUser = await TaskManager.findOneAndUpdate(
      { email, 'tasks._id': taskId },
      { $set: { 'tasks.$.status': status } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User or Task not found' });
    }

    const updatedTask = updatedUser.tasks.find(task => task._id.toString() === taskId);
    console.log("upt" + updatedTask);
    res.status(200).json({ message: 'Task status updated', updatedTask });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/tasks/:taskId', async (req, res) => {
  console.log("Delete Task Called");
  const { taskId } = req.params;
  const { email } = req.body;

  try {
    const updatedUser = await TaskManager.findOneAndUpdate(
      { email },
      { $pull: { tasks: { _id: taskId } } },
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

const port = 5000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
               
