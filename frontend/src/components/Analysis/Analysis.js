import React from 'react'
import './Analysis.css'
import { redirectIfNotLoggedIn } from '../Auth'

const Analysis = () => {
    redirectIfNotLoggedIn();
    return (
        <div>Analysis</div>
    )
}

export default Analysis