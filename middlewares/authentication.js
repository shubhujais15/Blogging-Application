// creating middleware jo har req ar response pr token ko check krega

const { validateToken } = require("../services/authentication");

// Also called generic middleware
function checkForAuthenticationCookie(cookieName) {
    return(req,res,next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if(!tokenCookieValue){
            return next();
        }
        // if there is token cookie value then we validate it
        try{
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
        } catch(error) {}
        return next();
    }
} 


module.exports = {
    checkForAuthenticationCookie,
}