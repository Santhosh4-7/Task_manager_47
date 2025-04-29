//

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('./models/user');

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB connection
const dbURI = 'mongodb://localhost:27017/Taskmanager';
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected successfully');
}).catch((err) => {
  console.error('Database connection failed:', err);
});

// Basic route check
app.get('/', (req, res) => {
  res.send('Task Manager Backend Active');
});

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'default_dev_secret';

// Utility for legacy hashing (not used in main flow)
const hashPassword = (pwd) => crypto.createHash('sha256').update(pwd).digest('hex');

// User registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password too short' });
    }

    const securePassword = await bcrypt.hash(password, 10);
    const newAccount = new User({ email, password: securePassword });
    await newAccount.save();

    const token = jwt.sign({ id: newAccount._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration complete',
      token,
      user: {
        id: newAccount._id,
        email: newAccount.email,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const account = await User.findOne({ email });
    if (!account) {
      return res.status(400).json({ message: 'Account not found', errorType: 'UserNotFound' });
    }

    const validPassword = await bcrypt.compare(password, account.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Incorrect credentials', errorType: 'WrongPassword' });
    }

    const token = jwt.sign({ id: account._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: account._id,
        email: account.email,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Get tasks
app.get('/tasks', async (req, res) => {
  const { email } = req.query;

  try {
    const account = await User.findOne({ email });
    if (!account) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(account.tasks);
  } catch (err) {
    console.error('Error retrieving tasks:', err);
    res.status(500).json({ message: 'Failed to retrieve tasks' });
  }
});

// add a new task
app.post('/tasks', async (req, res) => {
  const { title, completed, email, description, priority } = req.body;

  if (!email || !title || !priority) {
    return res.status(400).json({ error: 'Missing required fields: email, title, priority' });
  }

  try {
    const account = await User.findOne({ email });
    if (!account) {
      return res.status(404).json({ error: 'User not found' });
    }

    const task = {
      title,
      completed,
      description,
      priority,
      createdAt: new Date(),
    };

    account.tasks.push(task);
    await account.save();

    res.status(201).json(task);
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ error: err.message });
  }
});

// task updation
app.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { email } = req.body;
  const updatedStatus = 'complete';

  try {
    const updatedAccount = await User.findOneAndUpdate(
      { email, 'tasks._id': taskId },
      { $set: { 'tasks.$.status': updatedStatus } },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: 'Task or user not found' });
    }

    const task = updatedAccount.tasks.find(t => t._id.toString() === taskId);
    res.status(200).json({ message: 'Task updated', updatedTask: task });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// task deletion
app.delete('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { email } = req.body;

  try {
    const updatedAccount = await User.findOneAndUpdate(
      { email },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wasDeleted = !updatedAccount.tasks.some(t => t._id.toString() === taskId);
    if (wasDeleted) {
      return res.status(200).json({ message: 'Task removed' });
    }

    res.status(404).json({ message: 'Task not found' });
  } catch (err) {
    console.error('Task deletion error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// server code
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is live at http://localhost:${PORT}`);
});



