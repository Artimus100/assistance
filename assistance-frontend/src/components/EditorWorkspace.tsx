import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditorWorkspace: React.FC = () => {
    const navigate = useNavigate();
    const [workspaceId, setWorkspaceId] = useState('');
    const [editorId, setEditorId] = useState('');

    const handleWorkspaceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWorkspaceId(e.target.value);
    };

    const handleEditorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditorId(e.target.value);
    };

    const handleUpload = async () => {
        try {
            // Check if the workspace ID is valid
            const response = await axios.get(`http://localhost:3000/workspace/${workspaceId}`);
            if (response.status === 200) {
                // Workspace ID is valid, navigate to uploadVideo page with workspaceId and editorId in the URL
                navigate(`/workspace/${workspaceId}/uploadVideo?videoTitle=title&videoDescription=description`, { state: { editorId } });
            } else {
                console.error('Workspace not found');
                // Handle workspace not found error
            }
        } catch (error) {
            console.error('Error checking workspace:', error);
            // Handle error
        }
    };

    return (
        <div>
            <h2>Editor Workspace</h2>
            <label>
                Workspace ID:
                <input type="text" value={workspaceId} onChange={handleWorkspaceIdChange} />
            </label>
            <br />
            <label>
                Editor ID:
                <input type="text" value={editorId} onChange={handleEditorIdChange} />
            </label>
            <br />
            <button onClick={handleUpload}>Check Workspace</button>
        </div>
    );
};

export default EditorWorkspace;
