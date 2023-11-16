// import React, {useState} from 'react';
// import axios from 'axios';
// import './Login.css';

// const Login = () => {
//     const [email, setEmail] = useState("")
//     const [password, setPassword] = useState("")
    
//     const loginOpr = () => {
//         var errors=[];
//         if(email.length===0){
//             errors.push("The Email is Empty");
//         }
//         if(password.length===0){
//             errors.push("The Password is Empty");
//         }
//         if(errors.length>0){
//             alert(errors.join('\r\n'));
//             setEmail("")
//             setPassword("")
//         }
//         else{
//             const params = {
//                             'email' : email,
//                             'password' : password
//                             };
//             axios.get(process.env.REACT_APP_BACKEND_URI+'/api/loginUser', {params})
//                 .then(response => {
//                 if(response.data==="ok"){
//                     console.log("Success")
//                     localStorage.setItem("loggedIn","true");
//                     localStorage.setItem("loggedEmail",email)
//                     window.location.href='/';
//                 }
//                 else if(response.data==="no"){
//                     alert("Email and/or Password does not match");
//                     setEmail("")
//                     setPassword("")
//                 }
//                 else{
//                     alert(response.data)
//                     console.log("Fail")
//                     setEmail("")
//                     setPassword("")
//                 }
//             });
//         }
//     }

//     const signUp = () => {
//         console.log("Signup page calling");
//         window.location.href='/signup';
//     }

//     return (
//         <div className='container-login'>
//             <h2>Login</h2>
//             <div className='login-comp email'>
//                 Email
//                 <input type='email' value={email} onChange={e => setEmail(e.target.value)} required="required"/>
//             </div>
//             <div className='login-comp password'>
//                 Password
//                 <input type='password' value={password} onChange={e => setPassword(e.target.value)} required="required"/>
//             </div>
//             <button className='login-comp' onClick={loginOpr}>Login</button>
//             <button className='login-comp' onClick={signUp}>Sign Up</button>
//         </div>
//     )
// }

import React, {useState} from 'react';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    
    const loginOpr = () => {
        var errors=[];
        if(email.length===0){
            errors.push("The Email is Empty");
        }
        if(password.length===0){
            errors.push("The Password is Empty");
        }
        if(errors.length>0){
            alert(errors.join('\r\n'));
            setEmail("")
            setPassword("")
        }
        else{
            const params = {
                            'email' : email,
                            'password' : password
                            };
            axios.get(process.env.REACT_APP_BACKEND_URI+'/api/loginUser', {params})
                .then(response => {
                if(response.data==="ok"){
                    console.log("Success")
                    localStorage.setItem("loggedIn","true");
                    localStorage.setItem("loggedEmail",email)
                    window.location.href='/home';
                }
                else if(response.data==="no"){
                    alert("Email and/or Password does not match");
                    setEmail("")
                    setPassword("")
                }
                else{
                    alert(response.data)
                    console.log("Fail")
                    setEmail("")
                    setPassword("")
                }
            });
        }
    }

    const signUp = () => {
        console.log("Signup page calling");
        window.location.href='/signup';
    }

    return (
            <div className='login-background'>
                <div className='login-container'>
                    <div className='login-box'>
                        <h2 className='login-title'>Welcome</h2>
                        <form className='login-form'>
                            <div className='input-group'>
                                <input 
                                  type='email' 
                                  value={email} 
                                  onChange={e => setEmail(e.target.value)} 
                                  placeholder='Username' 
                                  required 
                                />
                            </div>
                            <div className='input-group'>
                            <input 
                              type='password' 
                              value={password} 
                              onChange={e => setPassword(e.target.value)} 
                              placeholder='Password' 
                              required 
                            />
                            <button type='button' className="button-log" onClick={loginOpr}>Login</button>
                            <button type="button" onClick={signUp} className='forgot-password'>Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login

 


