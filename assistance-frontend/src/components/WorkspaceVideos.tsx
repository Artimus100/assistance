import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoComponent from './VideoComponent';
import { useParams } from 'react-router-dom';

type Content = {
  id: number;
  title: string;
  description: string;
  videoFile: string;
};

const WorkspaceVideos: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const parsedWorkspaceId = workspaceId ? parseInt(workspaceId) : undefined;
  const [contents, setContents] = useState<Content[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (parsedWorkspaceId !== undefined) {
      fetchVideos(parsedWorkspaceId);
    }
  }, [parsedWorkspaceId]);

  const fetchVideos = async (workspaceId: number) => {
    try {
      const response = await axios.get<{ contents: Content[] }>(`/workspaces/${workspaceId}/videos`);
      setContents(response.data.contents);
      setLoading(false); // Set loading to false when videos are fetched
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to fetch videos'); // Set error message
      setLoading(false); // Set loading to false in case of error
    }
  };

  const handleVideoClick = (videoFile: string) => {
    // You can define your logic to handle streaming the video upon clicking here
    console.log('Clicked video:', videoFile);
    // Example: Open the video in a new tab
    window.open(videoFile, '_blank');
  };

  if (loading) {
    return <p>Loading...</p>; // Render loading state
  }

  if (error) {
    return <p>Error: {error}</p>; // Render error message if there's an error
  }

  if (!contents || contents.length === 0) {
    return <p>No videos found.</p>; // Render message for no videos
  }

  console.log('Videos:', contents); // Log videos to console

  return (
    <div>
      {contents.map((content) => (
        <VideoComponent key={content.id} content={content} />
      ))}
    </div>
  );
};

export default WorkspaceVideos;
