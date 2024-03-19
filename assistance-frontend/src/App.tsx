import { BrowserRouter, Routes, Route } from "react-router-dom";

import  LoginPage  from "./components/LoginPage";
// import RedirectPage from "./components/RedirectPage";
import RegistrationForm from "./components/RegistrationForm";
import OAuth2AuthenticationButton from "./components/OAuth2AuthenticationButton"
// import UploadVideoForm from "./components/UploadVideoForm";
import './App.css'
import CreatorDashboard from "./components/CreatorDashboard";
import UploadForm from './components/UploadForm';
import AuthButton from './components/AuthButton';
import WorkspaceForm from "./components/WorkspaceForm";
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oAuth" element={<OAuth2AuthenticationButton />} />
        {/* <Route path="/uploadVideo" element={<UploadVideoForm />} /> */}
        <Route path="/creatorDashbord" element={<CreatorDashboard />} />
        <Route path="/upload" element={<UploadForm/>}/>
        <Route path="/workspace" element={<WorkspaceForm/>}/>
      </Routes>

      {/* <div>
        <h1>Video Upload</h1>
        <UploadForm />
        <h1>Authorization</h1>
        <AuthButton />
      </div> */}
    </BrowserRouter>
  );
};

export default App
