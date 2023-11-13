import React from 'react'

const SideBarItems = () => {

    const goToHome = () => {
        window.location.href='/home'
    }

    const goToAnalysis = () => {
        window.location.href='/analysis'
    }

    const goToChatbot = () => {
        window.location.href='/chatbot'
    }

    const goToProfile = () => {
        window.location.href='/profile'
    }

    return (
        <div>
            <div><button className='login-comp' onClick={goToHome}>Home</button></div>
            <div><button className='login-comp' onClick={goToAnalysis}>Analysis</button></div>
            <div><button className='login-comp' onClick={goToChatbot}>Chatbot</button></div>
            <div><button className='login-comp' onClick={goToProfile}>Profile</button></div>
        </div>
    )
}

export default SideBarItems