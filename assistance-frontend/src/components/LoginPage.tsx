import React, { useState } from 'react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const role = await checkUserRole(username);
      if (role === 'host') {
        // Redirect to host page
        window.location.href = '/host';
      } else if (role === 'editor') {
        // Redirect to editor page
        window.location.href = '/editorWorkspace';
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Error logging in:', (error as Error).message);
      setError('Login failed');
    }
  };

  const checkUserRole = async (username: string): Promise<string | null> => {
    try {
      const hostResponse = await fetch('http://localhost:3000/hosts');
      if (!hostResponse.ok) {
        throw new Error('Failed to fetch hosts data');
      }
      const hostData = await hostResponse.json();
      // Fetch editors data
      const editorResponse = await fetch('http://localhost:3000/editors');
      if (!editorResponse.ok) {
        throw new Error('Failed to fetch editors data');
      }
      const editorData = await editorResponse.json();

      // Fetch hosts data
      

      // Check if the username is present in editors data
      const editorUsernames = editorData.map((editor: any) => editor.username);
      if (editorUsernames.includes(username)) {
        return 'editor';
      }

      // Check if the username is present in hosts data
      const hostUsernames = hostData.map((host: any) => host.username);
      if (hostUsernames.includes(username)) {
        return 'host';
      }

      // If the username is not found in either editors or hosts data
      return null;
    } catch (error) {
      console.error('Error checking user role:', error);
      throw new Error('Failed to check user role');
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginPage;
