import React from 'react'
import { useNavigate } from 'react-router-dom'; // import useNavigate from react-router-dom
import Logout from '../Logout/Logout';
import { isLogin } from '../Auth'
import logo from './logo.png'; // Make sure the logo path is correct
import './TopBar.css'

const TopBar = () => {
    const navigate = useNavigate(); // Hook for navigation

    const loginOpr = () => {
        navigate('/login');
    }
    const signupOpr = () => {
        navigate('/signup');
    }
    const goToHome = () => {
        navigate('/'); // Navigate to home page
    }
    return (
    <div className='top-bar-main'>
        <img src={logo} alt="Logo" className="logo" onClick={goToHome} /> {/* Logo added here */}
        <div className='web-page-title'>
            Energy Consumption Analysis
        </div>
        {
            isLogin() ?
                <div className='logout-box'>
                    <Logout />
                </div>
            :
            <>
                <div className='login-box-top-signup'>
                    <button className='login-button-top-signup' onClick={signupOpr}>Signup</button>
                </div>
                <div className='login-box-top'>
                    <button className='login-button-top' onClick={loginOpr}>Login</button>
                </div>
            </>
        }
    </div>
    )
}

export default TopBar;
