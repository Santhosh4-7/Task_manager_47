const mongoose = require('mongoose');

// Task Schema
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['incomplete', 'complete'], // Status can be 'incomplete' or 'complete'
    default: 'incomplete'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'], // Priority levels
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Email should be unique for each user
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Minimum length for password
  },
  tasks: [taskSchema] // Embedding tasks directly in the user schema
}, { timestamps: true });

// Remove password hashing before saving the user (no 'pre' hook)

// Create the User model from the schema
const TaskManager = mongoose.model('TaskManager', userSchema);

module.exports = TaskManager;
