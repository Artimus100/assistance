import React, { useState } from 'react';
import axios from 'axios';

interface WorkspaceFormProps {
  onSuccess: (workspace: any) => void;
}

const WorkspaceForm: React.FC<WorkspaceFormProps> = ({ onSuccess }) => {
  const [hostId, setHostId] = useState('');
  const [editorId, setEditorId] = useState('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/workspace', { hostId, editorId });
      onSuccess(res.data);
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
        type="text"
        placeholder="Host ID"
        value={hostId}
        onChange={(e) => setHostId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Editor ID"
        value={editorId}
        onChange={(e) => setEditorId(e.target.value)}
      />
      <button type="submit">Create Workspace</button>
      {error && <div>{error}</div>}
    </form>
  );
};

// Provide default props to prevent TypeScript error
WorkspaceForm.defaultProps = {
  onSuccess: () => {}, // A dummy function
};

export default WorkspaceForm;
