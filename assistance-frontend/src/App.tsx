import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Landing } from './components/Landing';


import './App.css'

function App() {
 

  return (
    <BrowserRouter>
    <Routes>
      <Route path= "/" />
    </Routes>
    </BrowserRouter>
  )
}

export default App
