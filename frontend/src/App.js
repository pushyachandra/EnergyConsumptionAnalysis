import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import './App.css';

import TopBar from './components/TopBar/TopBar';
import SideBar from './components/SideBar/SideBar';
import Sample from './components/Sample/Sample';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';

function App() {
  return (
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
          <Route path="/login" element={ <Login/> } />
          <Route path="/signup" element={ <SignUp/> } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;