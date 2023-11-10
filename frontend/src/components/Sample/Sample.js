import React from 'react'
import { redirectIfNotLoggedIn } from '../Auth';

const Sample = () => {
    redirectIfNotLoggedIn();
    return (
    <div>Sample</div>
    )
}

export default Sample