import React from 'react';

const RedirectPage: React.FC = () => {
  const handleRedirectToRegister = () => {
    window.location.href = 'http://localhost:5173/1';
  };

  const handleRedirectToRegisterEditor = () => {
    window.location.href = 'http://localhost:5173/1';
  };

  return (
    <div>
      <h1>Redirect Page</h1>
      <p>Choose an option to go to the registration page:</p>
      <button onClick={handleRedirectToRegister}>Register as Host</button>
      <button onClick={handleRedirectToRegisterEditor}>Register as Editor</button>
    </div>
  );
};

export default RedirectPage;
