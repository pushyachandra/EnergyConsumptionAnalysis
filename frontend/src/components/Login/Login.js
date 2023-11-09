import React, {useState} from 'react';
import './Login.css';

const Login = () => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    
    const loginOpr = () => {
        var errors=[];
        if(username.length===0){
            errors.push("The Username is Empty");
        }
        if(password.length===0){
            errors.push("The Password is Empty");
        }
        if(errors.length>0){
            alert(errors.join('\r\n'));
            setUsername("")
            setPassword("")
        }
    }

    const signUp = () => {
        console.log("Signup page calling");
        window.location.href='/signup';
    }

    return (
        <div className='container'>
            <h2>Login</h2>
            <div className='login-comp username'>
                Username
                <input type='email' value={username} onChange={e => setUsername(e.target.value)} required="required"/>
            </div>
            <div className='login-comp password'>
                Password
                <input type='password' value={password} onChange={e => setPassword(e.target.value)} required="required"/>
            </div>
            <button className='login-comp' onClick={loginOpr}>Login</button>
            <button className='login-comp' onClick={signUp}>Sign Up</button>
        </div>
    )
}

export default Login