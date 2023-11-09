import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import './App.css';

import TopBar from './components/TopBar/TopBar';
import SideBar from './components/SideBar/SideBar';
import Sample from './components/Sample/Sample';

function App() {
  return (
<<<<<<< Updated upstream
    <div className="App">
      Hello
    </div>
=======
    <BrowserRouter>
      <div className="topbar">
        <TopBar />
      </div>
      <div className="sidebar">
        <SideBar />
      </div>
      <div className="content">
        <Routes>
          <Route path="/" element={ <Sample/> } />
        </Routes>
      </div>
    </BrowserRouter>
>>>>>>> Stashed changes
  );
}

export default App;