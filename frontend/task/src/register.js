import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css'; 

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({}); // Store validation errors here
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/register', { email, password });
      setMessage(res.data.message);
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Wait for 2 seconds before redirecting
    } catch (err) {
      // Handle backend validation errors and display them
      if (err.response && err.response.data) {
        setErrors(err.response.data.errors || {});
        setMessage(err.response.data.message || 'Something went wrong');
      } else {
        setMessage('Something went wrong');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {/* Display email validation error */}
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Display password validation error */}
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        <button type="submit">Register</button>
      </form>

      {/* Display general message (e.g., success or error message) */}
      {message && <p>{message}</p>}

      {/* Add a Login link */}
      <div className="login-option">
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}

export default Register;
