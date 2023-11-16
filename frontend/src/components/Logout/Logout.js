import React from 'react'
import './Logout.css';

const Logout = () => {

    const logoutOpr = () => {
        localStorage.setItem('loggedEmail',null)
        localStorage.setItem('loggedIn',null)
        window.location.href='/'
    }

    return (
        <div className='user-info-section'>
            <div className='email-section'>
                <div className='email-display-item-1'>
                    User
                </div>
                <div className='email-display-item-2'>
                    {localStorage.getItem('loggedEmail')}
                </div>
            </div>
            <div className='logout-button-section'>
                <button className='logout-button' onClick={logoutOpr}>Log Out</button>
            </div>
        </div>
    )
}

export default Logout

// import React from 'react';
// import './Logout.css'; // Make sure this is correctly pointing to your Logout.css file

// const Logout = () => {
//     const loggedEmail = localStorage.getItem('loggedEmail');
//     const loggedIn = localStorage.getItem('loggedIn');

//     const logoutOpr = () => {
//         localStorage.clear();
//         window.location.href='/login';
//     }

//     return (
//         // <div className={loggedIn ? "logout-section" : "logout-section hidden"}>\
//         <div>
//             {loggedIn && (
//                 <div className="logout-container">
//                     <span>Logged In as: {loggedEmail}</span>
//                     <button onClick={logoutOpr}>Log Out</button>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Logout;
