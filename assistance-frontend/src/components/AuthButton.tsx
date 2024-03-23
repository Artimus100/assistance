import React from 'react';

const OAuthLoginButton: React.FC = () => {
  const handleLogin = () => {
    // Redirect the user to the backend server for OAuth authorization
    window.location.href = 'http://localhost:3000/auth';
  };

  return (
    <button onClick={handleLogin}>Login with OAuth</button>
  );
};

export default OAuthLoginButton;