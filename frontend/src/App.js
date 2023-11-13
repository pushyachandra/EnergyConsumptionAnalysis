import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import './App.css';

import TopBar from './components/TopBar/TopBar';
import SideBar from './components/SideBar/SideBar';
import Sample from './components/Sample/Sample';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Home from './components/Home/Home';
import Analysis from './components/Analysis/Analysis';
import Chatbot from './components/Chatbot/Chatbot';
import Profile from './components/Profile/Profile';

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
                <Route path="/home" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </div>
    </BrowserRouter>
  );
}

export default App;