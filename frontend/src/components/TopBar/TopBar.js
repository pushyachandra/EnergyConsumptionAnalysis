import React from 'react'
import Logout from '../Logout/Logout';
import { isLogin } from '../Auth'

const TopBar = () => {
    return (
    <div className='top-bar-main'>
        {isLogin() ? <Logout /> : null}
    </div>
    )
}

export default TopBar