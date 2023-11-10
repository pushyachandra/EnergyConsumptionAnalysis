import React, { useState } from 'react'
import axios from 'axios';
import './SignUp.css';

const SignUp = () => {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [rePassword, setRePassword] = useState("")
    
    const confirmSignUp = () => {
        var errors=[];
        if(firstName.length===0){
            errors.push("The First Name is Empty");
        }
        if(lastName.length===0){
            errors.push("The Last Name is Empty");
        }
        if(email.length===0){
            errors.push("The Email is Empty");
        }
        if(password.length===0){
            errors.push("The Password is Empty");
        }
        if(rePassword.length===0){
            errors.push("The Re-enter Password field is Empty");
        }
        if(password!==rePassword){
            errors.push("The Entered Passwords do not match");
        }
        if(errors.length>0){
            alert(errors.join('\r\n'));
            setFirstName("")
            setLastName("")
            setEmail("")
            setPassword("")
            setRePassword("")
        }
        else{
            const params = {'firstName' : firstName,
                            'lastName' : lastName,
                            'email' : email,
                            'password' : password
                            };
            axios.post(process.env.REACT_APP_BACKEND_URI+'/api/signUpUser', params)
                .then(response => {
                if(response.data==="ok"){
                    console.log("Success")
                    setFirstName("")
                    setLastName("")
                    setEmail("")
                    setPassword("")
                    setRePassword("")
                }
                else{
                    alert(response.data)
                    console.log("Fail")
                    setFirstName("")
                    setLastName("")
                    setEmail("")
                    setPassword("")
                    setRePassword("")
                }
            });
        }
    }

    const backToLoginOpr = () => {
        console.log("Back to Login Page");
        window.location.href='/login';
    }

    return (
        <div className='container-signup'>
            <h2>Sign Up</h2>
            <div className='login-comp username'>
                First Name
                <input type='text' value={firstName} onChange={e => setFirstName(e.target.value)} required="required"/>
            </div>
            <div className='login-comp username'>
                Last Name
                <input type='text' value={lastName} onChange={e => setLastName(e.target.value)} required="required"/>
            </div>
            <div className='login-comp username'>
                Email
                <input type='text' value={email} onChange={e => setEmail(e.target.value)} required="required"/>
            </div>
            <div className='login-comp password'>
                Password
                <input type='password' value={password} onChange={e => setPassword(e.target.value)} required="required"/>
            </div>
            <div className='login-comp password'>
                Re-Enter Password
                <input type='password' value={rePassword} onChange={e => setRePassword(e.target.value)} required="required"/>
            </div>
            <button className='login-comp' onClick={confirmSignUp}>Confirm</button>
            <button className='login-comp' onClick={backToLoginOpr}>Back to Login</button>
        </div>
    )
}

export default SignUp