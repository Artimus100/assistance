import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Video= {
  id: number;
  title: string;
  description: string;
  videoFile: string;
}

const WorkspaceVideos: React.FC<{ workspaceId: number }> = ({ workspaceId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchVideos();
  }, [workspaceId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/workspaces/${workspaceId}/videos`);
      setVideos(response.data.videos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Failed to fetch videos');
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Videos in Workspace</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div>
        {videos.length > 0 ? (
          videos.map((video) => (
            <div key={video.id}>
              <h3>{video.title}</h3>
              <p>{video.description}</p>
              {/* Display the videoFile however you need */}
              <video src={video.videoFile} controls />
            </div>
          ))
        ) : (
          <p>No videos available.</p>
        )}
      </div>
    </div>
  );
};

export default WorkspaceVideos;
