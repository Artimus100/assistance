import { BrowserRouter, Routes, Route } from "react-router-dom";

import {  Signin } from './components/Landing';
import  LoginPage  from "./components/LoginPage";
// import RedirectPage from "./components/RedirectPage";
import RegistrationForm from "./components/RegistrationForm";
import OAuth2AuthenticationButton from "./components/OAuth2AuthenticationButton"


import './App.css'

function App() {
 

  return (
    <BrowserRouter>
    <Routes>
    <Route path={"/register"} element={<RegistrationForm/>}/>

      <Route path={"/login"} element={<LoginPage/>}/>
      <Route path= {"/signin"} element={<Signin/>}/>
      <Route path= {"/oAuth"} element={<OAuth2AuthenticationButton/>}/>

    </Routes>
    </BrowserRouter>
  )
}

export default App
