import React, { useState, useEffect } from 'react';
import axios from 'axios';

enum VideoStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

type Video= {
  id: number;
  title: string;
  description: string;
  status: VideoStatus;
  videoFile: string;
}

const CreatorDashboard: React.FC = () => {
  const [pendingVideos, setPendingVideos] = useState<Video[]>([]);
  // const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPendingVideos();
  }, []);

  const fetchPendingVideos = async () => {
    try {
      const response = await axios.get<{ videoKeys?: Video[] }>('http://localhost:3000/getAllVideoKeys'); // Fetch all videos from the backend
      if (response.data.videoKeys) {
        const pendingVideos = response.data.videoKeys.filter(video => video.status === VideoStatus.PENDING); // Filter pending videos
        setPendingVideos(pendingVideos);
      } else {
        console.error('No videoKeys found in the response data.');
      }
    } catch (error) {
      console.error('Error fetching pending videos:', error);
    }
  };

  const approveVideo = async (videoId: number) => {
    try {
      await axios.post(`/hosts/Dashboard/approve/${videoId}`);
      // Refresh pending videos after approval
      fetchPendingVideos();
    } catch (error) {
      console.error('Error approving video:', error);
    }
  };

  const rejectVideo = async (videoId: number) => {
    try {
      await axios.post(`/hosts/Dashboard/reject/${videoId}`);
      // Refresh pending videos after rejection
      fetchPendingVideos();
    } catch (error) {
      console.error('Error rejecting video:', error);
    }
  };

  return (
    <div>
      <h1>Pending Videos</h1>
      <ul>
        {pendingVideos.map(video => (
          <li key={video.id}>
            <h2>{video.title}</h2>
            <p>{video.description}</p>
            <p>Status: {video.status}</p>
            <button onClick={() => approveVideo(video.id)}>Approve</button>
            <button onClick={() => rejectVideo(video.id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreatorDashboard;
