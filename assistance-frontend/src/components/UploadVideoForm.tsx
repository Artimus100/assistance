import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"

const UploadVideoForm: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>(); // Extract workspaceId from route params
  const parsedWorkspaceId = workspaceId ? parseInt(workspaceId) : undefined;
  const {editorId} = useParams<{editorId: string}>(); // Extract editorId from route params
  const parsedEditorId = editorId ? parseInt(editorId) : undefined;
  const [video, setVideo] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  // const [editorId, setEditorId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!video || !title || !description || !editorId) {
      setErrorMessage('Please fill out all fields');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('editorId', editorId);

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

  // return (
  //   <form onSubmit={handleSubmit}>
  //     <div>
  //       <label htmlFor="video">Video:</label>
  //       <input type="file" id="video" accept="video/*" name='video' onChange={(e) => setVideo(e.target.files ? e.target.files[0] : null)} />
  //     </div>
  //     <div>
  //       <label htmlFor="title">Title:</label>
  //       <input
  //         type="text"
  //         id="title"
  //         value={title}
  //         onChange={(e) => setTitle(e.target.value)}
  //       />
  //     </div>
  //     <div>
  //       <label htmlFor="description">Description:</label>
  //       <textarea
  //         id="description"
  //         value={description}
  //         onChange={(e) => setDescription(e.target.value)}
  //       />
  //     </div>
  //     <div>
  //       <label htmlFor="editorId">Editor ID:</label>
  //       <input
  //         type="text"
  //         id="editorId"
  //         value={String(parsedEditorId)} // Convert parsedEditorId to string
  //         readOnly // Make the input read-only
  //       />
  //     </div>
  //     <button type="submit">Upload Video</button>
  //     {errorMessage && <div>{errorMessage}</div>}
  //   </form>
  // );
  return (
   <form onSubmit={handleSubmit}>
    <Card key="1" className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Upload Video</CardTitle>
        <CardDescription>Choose a video from your device to upload</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-850">
        <div className="grid gap-2">
          <label htmlFor="file" className="w-full cursor-pointer">
            <span>Select Video</span>
            <input className="sr-only" id="file" type="file" accept="video/*" name='video' onChange={(e) => setVideo(e.target.files ? e.target.files[0] : null)} />
          </label>
          <Progress value={0} />
        </div>
        <div className="grid gap-2">
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video Title" />
          <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" type="textarea" />
        </div>
        <Button className="mt-auto" type="submit">Upload</Button>
      </CardContent>
    </Card>
    </form>
  );
  
  
};

export default UploadVideoForm;

/**
//  * v0 by Vercel.
//  * @see https://v0.dev/t/1Gxv5jdM0V7
//  * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
//  */
// import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Progress } from "@/components/ui/progress"

// export default function Component() {
//   return (
//     <Card key="1" className="mx-auto max-w-sm">
//       <CardHeader>
//         <CardTitle>Upload Video</CardTitle>
//         <CardDescription>Choose a video from your device to upload</CardDescription>
//       </CardHeader>
//       <CardContent className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-850">
//         <div className="grid gap-2">
//           <Button as="label" className="w-full" htmlFor="file" type="file" id="video" accept="video/*" name='video' onChange={(e) => setVideo(e.target.files ? e.target.files[0] : null)}>
//             Select Video
//             <Input className="sr-only" id="file" type="file" />
//           </Button>
//           <Progress value={0} />
//         </div>
//         <div className="grid gap-2">
//           <Input id="title value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video Title" />
//           <Input placeholder="Description"id="description" value={description} onChange={(e) => setDescription(e.target.value)} type="textarea" />
//         </div>
//         <Button className="mt-auto"  type="submit" >Upload</Button>
//       </CardContent>
//     </Card>
//   )
// }



