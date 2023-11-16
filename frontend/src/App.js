import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import './App.css';

import TopBar from './components/TopBar/TopBar';
import SideBar from './components/SideBar/SideBar';
import Tips from './components/Tips/Tips';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Home from './components/Home/Home';
import Analysis from './components/Analysis/Analysis';
import Chatbot from './components/Chatbot/Chatbot';
import Insights from './components/Insights/Insights';
import {isLogin} from './components/Auth';

function App() {
    return (
    <div>
        <BrowserRouter>
        <div className="topbar">
            <TopBar />
        </div>
        {isLogin() ?
        <>
            <div className="sidebar">
                <SideBar />
            </div>
            <div className="content">
                <Routes>
                    <Route path="/" element={ <Tips/> } />
                    <Route path="/login" element={ <Login/> } />
                    <Route path="/signup" element={ <SignUp/> } />
                    <Route path="/home" element={<Home />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/insights" element={<Insights />} />
                </Routes>
            </div>
        </>
        :
        <>
            <div className="content-full">
                <Routes>
                    <Route path="/" element={ <Tips/> } />
                    <Route path="/login" element={ <Login/> } />
                    <Route path="/signup" element={ <SignUp/> } />
                    <Route path="/home" element={<Home />} />
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/insights" element={<Insights />} />
                </Routes>
            </div>
        </>
        }  
        
    </BrowserRouter>
    </div>
  );
}

export default App;