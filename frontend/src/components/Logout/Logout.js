// import React from 'react'

// const Logout = () => {

//     const logoutOpr = () => {
//         localStorage.setItem('loggedEmail',null)
//         localStorage.setItem('loggedIn',null)
//         window.location.href='/login'
//     }

//     return (
//         <div>
//             Logged In as : {localStorage.getItem('loggedEmail')}
//             <button className='login-comp' onClick={logoutOpr}>Log Out</button>
//         </div>
//     )
// }

// export default Logout

import React from 'react';
import './Logout.css'; // Make sure this is correctly pointing to your Logout.css file

const Logout = () => {
    const loggedEmail = localStorage.getItem('loggedEmail');
    const loggedIn = localStorage.getItem('loggedIn');

    const logoutOpr = () => {
        localStorage.clear();
        window.location.href='/login';
    }

    return (
        <div className={loggedIn ? "logout-section" : "logout-section hidden"}>
            <div className="logout-title">"ENERGY CONSUMPTION ANALYSIS"</div>
            {loggedIn && (
                <div className="logout-container">
                    <span>Logged In as: {loggedEmail}</span>
                    <button onClick={logoutOpr}>Log Out</button>
                </div>
            )}
        </div>
    );
}

export default Logout;
