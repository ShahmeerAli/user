const JWTServices = require("../services/JWTServices");
const User = require('../models/user');
const UserDTO = require("../dto/user");

const auth = async(req,res,next) => {
    const {accessToken, refreshToken} = req.body;

    //Validating accessToken and refreshToken
    if(!accessToken || !refreshToken){
        const error = {
            status: 401,
            message: "Unauthorized"
        }
        return next(error);
    }

    //Verify accessToken
    let id;
    try{
        id = JWTServices.verifyAccessToken(accessToken);
    }
    catch(error){
        return next(error);
    }
    let user;
    try{
        user = await User.findOne({_id:id});
    }
    catch(error){
        return next(error);
    }

    const userDto = new UserDTO(user);
    
    req.user = userDto;

    next();
}

module.exports = auth;