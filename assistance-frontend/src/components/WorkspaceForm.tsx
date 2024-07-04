import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const WorkspaceForm: React.FC = () => {
  const [hostId, setHostId] = useState<number | ''>('');
  const [editorId, setEditorId] = useState<number | ''>('');
  const [name, setName] = useState<string>('');
  const [hostUsername, setHostUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert hostId and editorId to integers
      const parsedHostId = parseInt(hostId.toString(), 10);
      const parsedEditorId = parseInt(editorId.toString(), 10);

      await axios.post('http://localhost:3000/hosts/workspace', { hostId: parsedHostId, editorId: parsedEditorId, name });
      setSuccessMessage('Workspace created successfully');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred');
      }
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/hostWorkspace/${hostUsername}`); // Use navigate instead of history.push
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Host ID"
          value={hostId}
          onChange={(e) => setHostId(parseInt(e.target.value))}
        />
        <input
          type="number"
          placeholder="Editor ID"
          value={editorId}
          onChange={(e) => setEditorId(parseInt(e.target.value))}
        />
        <input
          type="text"
          placeholder="Workspace Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Create Workspace</button>
        {successMessage && <p>{successMessage}</p>}
        {error && <div>{error}</div>}
      </form>
      <form onSubmit={handleUsernameSubmit}>
        <input
          type="text"
          placeholder="Host Username"
          value={hostUsername}
          onChange={(e) => setHostUsername(e.target.value)}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default WorkspaceForm;
