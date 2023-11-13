import React from 'react'
import { redirectIfNotLoggedIn } from '../Auth'

const Profile = () => {
    redirectIfNotLoggedIn();
    return (
        <div>Profile</div>
    )
}

export default Profile