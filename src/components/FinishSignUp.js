import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const FinishSignUp = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  const handleFinishSignUp = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      navigate('/');
    } catch (error) {
      setError('Failed to complete sign up. Please try again.');
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="finish-signup">
      <header>
        <h1>Chess Game</h1>
      </header>
      <main>
        <h2>Complete Sign Up</h2>
        <form onSubmit={handleFinishSignUp}>
          <input
            type="email"
            placeholder="Confirm Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Complete Sign Up</button>
        </form>
      </main>
    </div>
  );
};

export default FinishSignUp;