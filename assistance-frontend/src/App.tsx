import { BrowserRouter, Routes, Route } from "react-router-dom";

import {  Signin } from './components/Landing';
import  LoginPage  from "./components/LoginPage";


import './App.css'

function App() {
 

  return (
    <BrowserRouter>
    <Routes>
      <Route path={"/"} element={<LoginPage/>}/>
      <Route path= {"/signin"} element={<Signin/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
