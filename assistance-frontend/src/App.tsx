import { BrowserRouter, Routes, Route } from "react-router-dom";

import  LoginPage  from "./components/LoginPage";
// import RedirectPage from "./components/RedirectPage";
import RegistrationForm from "./components/RegistrationForm";
import OAuth2AuthenticationButton from "./components/OAuth2AuthenticationButton"
import UploadVideoForm from "./components/UploadVideoForm";
import './App.css'

function App() {
  return (
    <BrowserRouter>
    <Routes>
    <Route path={"/register"} element={<RegistrationForm/>}/>

      <Route path={"/login"} element={<LoginPage/>}/>
      <Route path= {"/oAuth"} element={<OAuth2AuthenticationButton/>}/>
      <Route path={"/uploadVideo"} element={<UploadVideoForm/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
