import React from 'react'
import Logout from '../Logout/Logout';
import { isLogin } from '../Auth'
import './TopBar.css'

const TopBar = () => {
    return (
    <div className='top-bar-main'>
        <div>
        </div>
        {isLogin() ? <div className='logout-box'><Logout /></div> : null}
    </div>
    )
}

export default TopBar