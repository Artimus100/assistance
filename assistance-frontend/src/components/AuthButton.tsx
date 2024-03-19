import React from 'react';

const AuthButton: React.FC = () => {
  const handleAuth = () => {
    window.location.href = 'http://localhost:3000/authorize';
  };

  return (
    <div>
      <button onClick={handleAuth}>Authorize</button>
    </div>
  );
};

export default AuthButton;