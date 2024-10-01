import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../firebase/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('Failed to log in. Please check your email and password.');
      console.error('Error logging in:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      setError('Failed to log in with Google. Please try again.');
      console.error('Error logging in with Google:', error);
    }
  };

  return (
    <div className="login">
      <h1 className="login-title">Chess Battle</h1>
      <form onSubmit={handleLogin}>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Log in</button>
      </form>
      <button className="google-button" onClick={handleGoogleLogin}>
        Log in with Google
      </button>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;