import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Workspace {
    id: number;
    name: string;
    // Add other workspace properties as needed
}

const Dashboard: React.FC = () => {
    const { username } = useParams<{ username: string }>(); // Retrieve username from URL params
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchWorkspaces();
    }, [username]); // Refetch workspaces when the username changes

    const fetchWorkspaces = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Workspace[]>(`http://localhost:3000/hosts/workspaces/${username}`);
            setWorkspaces(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            setError('Failed to fetch workspaces');
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <div>
                <p>Username: {username}</p>
                {/* <button onClick={fetchWorkspaces}>Fetch Workspaces</button> */}
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {workspaces.length > 0 && (
                <div>
                    <h2>Workspaces created by {username}</h2>
                    <ul>
                        {workspaces.map(workspace => (
                            <li key={workspace.id}>{workspace.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
