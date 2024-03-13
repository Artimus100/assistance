import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

const UploadVideoForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editorId, setEditorId] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoFile) {
      setMessage('Please select a video file');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('editorId', editorId);
    formData.append('video', videoFile);

    try {
      const response = await axios.post('http://localhost:3000/uploadVideo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error uploading video:', error);
      setMessage('Failed to upload video');
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea value={description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} required />
        </div>
        <div>
          <label>Editor ID:</label>
          <input type="text" value={editorId} onChange={(e: ChangeEvent<HTMLInputElement>) => setEditorId(e.target.value)} required />
        </div>
        <div>
          <label>Upload Video:</label>
          <input type="file" accept="video/*" onChange={handleFileChange} required />
        </div>
        <button type="submit">Upload</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadVideoForm;
