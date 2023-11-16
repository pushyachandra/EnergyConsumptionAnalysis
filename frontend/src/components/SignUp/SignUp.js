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
                    alert("Sign Up Successful")
                    window.location.href='/login';
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
        <div className='lg-login-background'> {/* Assuming you want the full-page background like the login page */}
            <div className='lg-login-container'> {/* Use the login-container for consistent padding and max-width */}
                <div className='lg-login-box'> {/* The box to contain the form elements */}
                    <h2 className='lg-login-title'>Sign Up</h2>
                    <div className='lg-login-form'> {/* The form to contain the inputs and buttons */}
                        <div className='lg-input-group'>
                            <input 
                              type='text' 
                              placeholder="First Name" 
                              value={firstName} 
                              onChange={e => setFirstName(e.target.value)} 
                              required 
                            />
                        </div>
                        <div className='lg-input-group'>
                            <input 
                              type='text' 
                              placeholder="Last Name" 
                              value={lastName} 
                              onChange={e => setLastName(e.target.value)} 
                              required 
                            />
                        </div>
                        <div className='lg-input-group'>
                            <input 
                              type='email' 
                              placeholder="Email" 
                              value={email} 
                              onChange={e => setEmail(e.target.value)} 
                              required 
                            />
                        </div>
                        <div className='lg-input-group'>
                            <input 
                              type='password' 
                              placeholder="Password" 
                              value={password} 
                              onChange={e => setPassword(e.target.value)} 
                              required 
                            />
                        </div>
                        <div className='lg-input-group'>
                            <input 
                              type='password' 
                              placeholder="Re-enter Password" 
                              value={rePassword} 
                              onChange={e => setRePassword(e.target.value)} 
                              required 
                            />
                        </div>
                        <button type="button" onClick={confirmSignUp} className='lg-button-log'>Confirm</button>
                        <button type="button" onClick={backToLoginOpr} className='lg-forgot-password'>Back to Login</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp