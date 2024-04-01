import React, { useState } from 'react';
import axios from 'axios';

const UploadVideoForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<{ [key: string]: string }>({
    title: '',
    description: '',
    tags: '',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleMetadataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMetadata(prevMetadata => ({
      ...prevMetadata,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('videoFile', file);
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      const response = await axios.post('/editor/workspace/:workspaceId/:editorId/uploadVideo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  };

  return (
    <div>
      <h2>Upload Video</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="file" accept="video/*" onChange={handleFileChange} />
        </div>
        <div>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={metadata.title}
            onChange={handleMetadataChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={metadata.description}
            onChange={handleMetadataChange}
          />
        </div>
        <div>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma-separated)"
            value={metadata.tags}
            onChange={handleMetadataChange}
          />
        </div>
        <button type="submit">Uplsssoad</button>
      </form>
    </div>
  );
};

export default UploadVideoForm;