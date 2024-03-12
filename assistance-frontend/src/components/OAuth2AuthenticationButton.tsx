import React from 'react';

const handleOAuth2Authentication = () => {
    const clientId = '975807587258-1b81eb7ktm6fri0e99rlmm5png3k6i61.apps.googleusercontent.com'; // Replace with your application's client ID
    const redirectUri = 'http://localhost:3000/oauth2callback'; // Replace with your application's redirect URI
    const scopes = [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.upload'
    ]; // Scopes of access requested

    const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('+')}`;

    window.location.href = authUrl; // Redirect the user to Google's OAuth2 authentication endpoint
};

const OAuth2AuthenticationButton: React.FC = () => {
    return (
        <button onClick={handleOAuth2Authentication}>Authenticate with Google</button>
    );
};

export default OAuth2AuthenticationButton;
