import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { auth, firestore } from '../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // This effect runs on component mount to check authentication state and fetch user data.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setDateOfBirth(userData.dateOfBirth ? new Date(userData.dateOfBirth) : null);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // This function handles the form submission for updating the user's profile.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (user) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), {
          name,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null
        });
        setMessage('Profile updated successfully');
      } catch (error) {
        setError('Error updating profile');
        console.error('Error updating profile:', error);
      }
    }
  };

  if (!user) {
    return <div className="profile">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile">
      <div className="logo-text" onClick={() => navigate('/')}>Chess Battle</div>
      <h1>Profile</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <DatePicker
            selected={dateOfBirth}
            onChange={(date) => setDateOfBirth(date)}
            maxDate={new Date()}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Select your date of birth"
            isClearable
            peekNextMonth
            showMonthDropdown
            dropdownMode="select"
          />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;