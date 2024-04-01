import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

type VideoProps = {
  videoKey: string; // The key of the video in the S3 bucket
}
// Define prop types for VideoPlayer component




const VideoPlayer: React.FC<VideoProps> = ({ videoKey }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideo = async () => {
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
    VideoPlayer.propTypes = {
      videoKey: PropTypes.string.isRequired,
    };
    fetchVideo();

    // Clean up when component unmounts
    return () => {
      if (videoRef.current) {
        videoRef.current.src = ''; // Clear the src attribute
      }
    };
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
