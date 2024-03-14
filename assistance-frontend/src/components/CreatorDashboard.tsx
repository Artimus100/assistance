import React, { useState, useEffect } from 'react';
import axios from 'axios';

enum VideoStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

interface Video {
  id: number;
  title: string;
  description: string;
  status: VideoStatus;
}

const CreatorDashboard: React.FC = () => {
  const [pendingVideos, setPendingVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchPendingVideos();
  }, []);

  const fetchPendingVideos = async () => {
    try {
      const response = await axios.get<{ videos: Video[] }>('/awaiting-approval');
      console.log('Response data:', response.data);
      setPendingVideos(response.data.videos);
    } catch (error) {
      console.error('Error fetching pending videos:', error);
    }
  };

  console.log('Pending videos:', pendingVideos); // Add this line for debugging

  const approveVideo = async (videoId: number) => {
    try {
      await axios.post(`/approve/${videoId}`);
      // Refresh pending videos after approval
      fetchPendingVideos();
    } catch (error) {
      console.error('Error approving video:', error);
    }
  };

  const rejectVideo = async (videoId: number) => {
    try {
      await axios.post(`/reject/${videoId}`);
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
