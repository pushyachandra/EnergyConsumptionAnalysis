import React from 'react'

const SideBarItems = () => {

    const goToHome = () => {
        window.location.href='/home'
    }

    const goToAnalysis = () => {
        window.location.href='/home'
    }

    const goToChatbot = () => {
        window.location.href='/home'
    }

    const goToProfile = () => {
        window.location.href='/home'
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