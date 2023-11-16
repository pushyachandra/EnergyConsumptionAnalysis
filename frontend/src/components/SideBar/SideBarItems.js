// import React from 'react'

// const SideBarItems = () => {

//     const goToHome = () => {
//         window.location.href='/home'
//     }

//     const goToAnalysis = () => {
//         window.location.href='/analysis'
//     }

//     const goToChatbot = () => {
//         window.location.href='/chatbot'
//     }

//     const goToProfile = () => {
//         window.location.href='/profile'
//     }

//     return (
//         <div>
//             <div><button className='login-comp' onClick={goToHome}>Home</button></div>
//             <div><button className='login-comp' onClick={goToAnalysis}>Analysis</button></div>
//             <div><button className='login-comp' onClick={goToChatbot}>Chatbot</button></div>
//             <div><button className='login-comp' onClick={goToProfile}>Profile</button></div>
//         </div>
//     )
// }

// export default SideBarItems

import React from 'react';
import './SideBar.css'; // Make sure the path is correct based on your file structure

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

            const goToInsights = () => {
                window.location.href='/insights'
            }
        

    return (
        <div className="sidebar-container">
            <button className='sidebar-btn' onClick={goToHome}>Home</button>
            <button className='sidebar-btn' onClick={goToAnalysis}>Analysis</button>
            <button className='sidebar-btn' onClick={goToChatbot}>Chatbot</button>
            <button className='sidebar-btn' onClick={goToInsights}>Insights</button>
            <button className='sidebar-btn' onClick={goToProfile}>Profile</button>
        </div>
    )
}

export default SideBarItems;