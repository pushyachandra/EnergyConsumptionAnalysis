import React from 'react'
import { isLogin } from '../Auth'
import SideBarItems from './SideBarItems'

const SideBar = () => {
    return (
        <div>
            {isLogin() ? <SideBarItems /> : null}
        </div>
    )
}

export default SideBar