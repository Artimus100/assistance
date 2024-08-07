import { BrowserRouter, Routes, Route } from "react-router-dom";

import  LoginPage  from "./components/LoginPage";
// import RedirectPage from "./components/RedirectPage";
import RegistrationForm from "./components/RegistrationForm";
//import OAuth2CallbackPage from "./components/OAuth2CallbackPage"
 import UploadVideoForm from "./components/UploadVideoForm";
import './App.css'
import CreatorDashboard from "./components/CreatorDashboard";
//import UploadForm from './components/UploadForm';
import AuthButton from './components/AuthButton';
import EditorWorkspace from "./components/EditorWorkspace" 
import WorkspaceForm from "./components/WorkspaceForm";
import Dashboard from "./components/HostWorkspaces"
import VideoList from "./components/VideoList";
// import UploadVideoToYouTube from "./components/UploadVideoToYoutube"
const App: React.FC = () => {
  return (
    
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/oAuth" element={<OAuth2CallbackPage />} /> */}
         <Route path="/auth" element={<AuthButton />} /> 
        <Route path="/creatorDashbord" element={<CreatorDashboard />} />
        <Route path="/workspace/:workspaceId/:editorId/uploadVideo" element={<UploadVideoForm />} /> 

        {/* <Route path="/upload" element={<UploadForm/>}/> */}
        <Route path="/hostWorkspace" element={<WorkspaceForm/>}/>
        {/*  <Route path="/workspaceUpload" element={<UploadVideoToYouTube/>}/>
         */}
        <Route path="/editorWorkspace" element={<EditorWorkspace/>}/>
        <Route path="/hostWorkspace/:username" element={<Dashboard/> }/>
        <Route path="/workspace/:workspaceId/videos" element={<VideoList/>} />

      </Routes>
    

       
      {/* <div>
        <h1>Video Upload</h1>
        <UploadForm />1
        <h1>Authorization</h1>
        <AuthButton />
      </div> */}
    </BrowserRouter>
  );
};

export default App
