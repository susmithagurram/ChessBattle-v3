import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

/* Component for finishing the sign up process */
const FinishSignUp = () => {
  // State to hold the user's email and any error messages
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /* Effect to check if the user is already signed in with email link */
  useEffect(() => {
    // Check if the current URL is a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const savedEmail = window.localStorage.getItem('emailForSignIn');
      // If an email is saved, set it to the state
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  /* Function to handle the sign up completion */
  const handleFinishSignUp = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      // Attempt to sign in with the email link
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn'); // Clear saved email
      navigate('/'); // Redirect to home page upon success
    } catch (error) {
      // Handle any errors during sign in
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