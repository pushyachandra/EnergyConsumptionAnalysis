import React from 'react';
import { isLogin } from '../Auth';
import SideBarItems from './SideBarItems.js';
import './SideBar.css'; // Ensure this import is correct based on your file structure

const SideBar = () => {
    return (
        <div>
            {isLogin() ? <SideBarItems /> :  (
                <div className="sidebar-message">
                    "ENERGY
                    <br />
                    CONSUMPTION
                    <br />
                    ANALYSIS"
                </div>)}
        </div>
    )
}

export default SideBar;