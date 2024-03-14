import React, { useState } from 'react';

const RegistrationForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(role === 'host' ? 'http://localhost:3000/register' : 'http://localhost:3000/registerEditor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Reset form fields after successful registration
      setUsername('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole('');

      // Redirect to login page after successful registration
      window.location.href = '/login';
    } catch (error) {
      console.error('Registration failed:', (error as Error).message);
      // Handle registration error, display error message to user
    }
  };

  return (
    <div>
        <form onSubmit={handleRegistration}>
  <input type="text" name="username" placeholder="username" />
  <input type="text" name="firstname" placeholder="firstname" />
  <input type="text" name="lastname" placeholder="lastname" />
  <input type="password" name="password" placeholder="password" />
  <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="host">Host</option>
            <option value="editor">Editor</option>
          </select>
        </div>
  <button type="submit">Submit</button>
</form>

      {/* <h1>Registration Form</h1>
      <form onSubmit={handleRegistration}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="host">Host</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form> */}
    </div>
  );
};

export default RegistrationForm;
