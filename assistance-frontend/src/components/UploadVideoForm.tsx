import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios';

const UploadVideoForm: React.FC = () => {
  const { workspaceId, editorId } = useParams<{ workspaceId: string, editorId: string }>(); // Extract workspaceId and editorId from route params
  const parsedWorkspaceId = workspaceId ? parseInt(workspaceId) : undefined;
  const parsedEditorId = editorId ? parseInt(editorId) : undefined;
  const [video, setVideo] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!video || !title || !description || !parsedEditorId) { // Use parsedEditorId instead of editorId
      setErrorMessage('Please fill out all fields');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('editorId', String(parsedEditorId)); // Convert parsedEditorId to string before appending to formData

    try {
      await axios.post(`http://localhost:3000/workspace/${workspaceId}/${editorId}/uploadVideo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setErrorMessage('');
      alert('Video uploaded successfully');
    } catch (error) {
      setErrorMessage('Failed to upload video');
      console.error('Error uploading video:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="video">Video:</label>
        <input
          type="file"
          id="video"
          accept="video/*"
          name='video'
          onChange={(e) => setVideo(e.target.files ? e.target.files[0] : null)}
        />
      </div>
      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="editorId">Editor ID:</label>
        <input
          type="text"
          id="editorId"
          value={String(parsedEditorId)} // Convert parsedEditorId to string
          readOnly // Make the input read-only
        />
      </div>
      <button type="submit">Upload Video</button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default UploadVideoForm;
