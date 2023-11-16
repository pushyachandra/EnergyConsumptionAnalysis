function checkLogin(){
    if(localStorage.getItem('loggedIn')===null || localStorage.getItem('loggedEmail')===null){
        window.location.href='/';
    }
}

function isLogin(){
    if(localStorage.getItem('loggedIn')!==null &&
    localStorage.getItem('loggedEmail')!==null &&
    localStorage.getItem('loggedIn')!=='null' &&
    localStorage.getItem('loggedEmail')!=='null'){
        return true;
    }
    else{
        return false;
    }
}

function redirectIfNotLoggedIn(){
    if(!isLogin()){
        window.location.href='/';
    }
}

export { checkLogin, isLogin, redirectIfNotLoggedIn };