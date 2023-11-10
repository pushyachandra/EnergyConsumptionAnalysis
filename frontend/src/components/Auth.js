function checkLogin(){
    if(localStorage.getItem('loggedIn')===null || localStorage.getItem('loggedEmail')===null){
        window.location.href='/login';
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
        window.location.href='/login';
    }
}

export { checkLogin, isLogin, redirectIfNotLoggedIn };