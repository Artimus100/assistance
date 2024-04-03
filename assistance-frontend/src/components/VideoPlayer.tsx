import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoKey, setVideoKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoKey = async () => {
      try {
        // Make a request to your backend to fetch the video key
        const response = await axios.get('/getAllvideoKeys'); // Adjust the endpoint URL as needed
        const key = response.data.videoFile;
        setVideoKey(key);
      } catch (error) {
        console.error('Error fetching video key:', error);
      }
    };

    fetchVideoKey();

    // Clean up when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.src = ''; // Clear the src attribute
      }
    };
  }, []);

  useEffect(() => {
    const fetchVideo = async () => {
      if (!videoKey) return;

      try {
        // Make a request to your backend to fetch the video stream
        const response = await axios.get(`/streamVideo/${videoKey}`, {
          responseType: 'blob', // Set response type to blob
        });

        // Create a URL for the video blob
        const videoBlobUrl = URL.createObjectURL(response.data);

        // Set the src attribute of the video element
        if (videoRef.current) {
          videoRef.current.src = videoBlobUrl;
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      }
    };

    fetchVideo();
  }, [videoKey]);

  return (
    <div>
      <video controls ref={videoRef} width="640" height="360">
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
