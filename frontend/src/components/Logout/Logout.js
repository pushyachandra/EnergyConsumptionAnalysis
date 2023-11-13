import React from 'react'

const Logout = () => {

    const logoutOpr = () => {
        localStorage.setItem('loggedEmail',null)
        localStorage.setItem('loggedIn',null)
        window.location.href='/login'
    }

    return (
        <div>
            Logged In as : {localStorage.getItem('loggedEmail')}
            <button className='login-comp' onClick={logoutOpr}>Log Out</button>
        </div>
    )
}

export default Logout