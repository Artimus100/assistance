import React from 'react';

type VideoComponentProps = {
  content: {
    id: number;
    title: string;
    description: string;
    videoFile: string;
  };
};

const VideoComponent: React.FC<VideoComponentProps> = ({ content }) => {
  return (
    <div>
      <h3>{content.title}</h3>
      <p>{content.description}</p>
      {/* Assuming your videoFile is a URL, you can use the <video> element to stream it */}
      <video controls>
        <source src={content.videoFile} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoComponent;
