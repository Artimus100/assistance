import React, { useState } from 'react';
import axios from 'axios';

const WorkspaceForm: React.FC = () => {
  const [hostId, setHostId] = useState<number | ''>('');
  const [editorId, setEditorId] = useState<number | ''>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert hostId and editorId to integers
      const parsedHostId = parseInt(hostId.toString(), 10);
      const parsedEditorId = parseInt(editorId.toString(), 10);

      await axios.post('http://localhost:3000/workspace', { hostId: parsedHostId, editorId: parsedEditorId });
      setSuccessMessage('Workspace created successfully');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred');
      }
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"  // Change input type to number
        placeholder="Host ID"
        value={hostId}
        onChange={(e) => setHostId(parseInt(e.target.value))}
      />
      <input
        type="number"  // Change input type to number
        placeholder="Editor ID"
        value={editorId}
        onChange={(e) => setEditorId(parseInt(e.target.value))}
      />
      <button type="submit">Create Workspace</button>
      {successMessage && <p>{successMessage}</p>}
      {error && <div>{error}</div>}
    </form>
  );
};

export default WorkspaceForm;
