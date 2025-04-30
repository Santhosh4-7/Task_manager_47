TASK_MANAGER 

------------------
SETUP INSTRUCTIONS
------------------

git clone https://github.com/Santhosh4-7/Task_manager_47.git



DATABASE--MONGODB
make sure you connect the database with the backend using the connection string.
MONGO_URI=mongodb://localhost:27017/taskmanagerdb

BACKEND --

cd task-manager-backend
node index 
output-- server running  
         true


FRONTEND ---------------------------

cd frontenx
npx install react #yourappname

copy the src files from frontend/task/src i.e. App,Login,Register  and paste it in the src folder of your react app.

cd to_directory_of_your_app and npm start
------------------------------------
PORT AND KEY_INFO
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanagerdb  # or MongoDB Atlas URI if using cloud DB
SECRET_KEY=your_secret_key_here


-------------------
MODEL ARCHITECTURE
-------------------

THE MODEL IS CHOSEN TO BE A USER WITH THE MENTIONED ATTRIBUTES i.e. 
----------
Unique ID
Title (text)
Description (text)
Status (complete/incomplete)
Priority (Low, Medium, High)
Creation date
User ID (associated with the creator)
----------


Technical Choice --- MERN STACK

I used MERN Stack as it offers several advantages and its very easy to debug in MERN stack for me personally as I worked many projects in it.

Features Implemented -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Implemented all the features mentioned in the document
         1.Register and log in with email/password
         2.View their tasks
         3.Add new tasks
         4.Mark tasks as complete
         5.Delete tasks
         6.Filter tasks by status (All, Active, Completed).


Secured Authorization -- Using Bcrypt JS a secured authorization has been performed 

CustomHook -- Custom hook called useFetchtasks is implmented to fetch tasks , it makes refetch(after creation or deletion of task) job easy and it makes the code look more readable.

MongoDb - Using MongoDb a suiting model was designed 
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

MODEL--
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
----


Comments -- I have commented on everyline to ease the setup experience for the users.

Used Routers for navigation at some points.

Used usestates for assigning values and keep track of it.



The instruction for running locally has already been provided above. 

Thank you !!!


