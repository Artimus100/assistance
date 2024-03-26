import React, { useState } from 'react';
import axios from 'axios';

interface HostRegistrationData {
  username: string;
  firstname: string;
  lastname: string;
  password: string;
}

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<HostRegistrationData>({
    username: '',
    firstname: '',
    lastname: '',
    password: '',
  });
  const [message, setMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/register', formData);
      if (response.status === 201) {
        // Registration successful, generate JWT token
        const tokenResponse = await axios.post('http://localhost:3000/generateToken', {
          username: formData.username,
        });
        const token = tokenResponse.data.token;
        // Store token in local storage
        localStorage.setItem('jwtToken', token);
        setMessage('Registration successful');
      }
    } catch (error) {
      console.error('Registration failed:', error as Error);
      setMessage('Registration failed');
    }
  };

  return (
    <div>
      <h2>Host Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div>
          <label>First Name:</label>
          <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegistrationForm;
