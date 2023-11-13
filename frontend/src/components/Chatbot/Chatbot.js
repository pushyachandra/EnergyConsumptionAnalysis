import React from 'react'
import { redirectIfNotLoggedIn } from '../Auth'

const Chatbot = () => {
    redirectIfNotLoggedIn();
    return (
        <div>Chatbot</div>
    )
}

export default Chatbot