import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Video {
  id: number;
  title: string;
  description: string;
  videoFile: string;
  status: string;
  uploadDate: string;
  workspaceId: number;
}

const VideoList: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>(); // Get workspaceId from route params
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/workspaces/${workspaceId}/videos`);
        setVideos(response.data.contents);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchVideos();
  }, [workspaceId]); // Fetch videos whenever workspaceId changes

  return (
    <div>
      {videos && videos.length > 0 ? (
        videos.map((video) => (
          <div key={video.id}>
            <h3>Title: {video.title}</h3>
            <p>Description: {video.description}</p>
            <p>Status: {video.status}</p>
            <p>Upload Date: {video.uploadDate}</p>
            <p>Workspace ID: {video.workspaceId}</p>
            <video controls width="640" height="360">
              <source src={video.videoFile} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <hr />
          </div>
        ))
      ) : (
        <div>No videos found.</div>
      )}
    </div>
  );
};

export default VideoList;
