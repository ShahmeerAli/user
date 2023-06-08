const Joi = require('joi');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const UserDTO = require('../dto/user');
const JWTServices = require('../services/JWTServices');
const passwordPattern =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const RefreshToken = require('../models/token');

const authController = {
    // Register function for registering user
    async register(req,res,next){
        //1. Validating user input using Joi
        const registerSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name:Joi.string().max(30).required(),
            email:Joi.string().email().required(),
            password:Joi.string().pattern(passwordPattern).required(),
            confirmPassword:Joi.ref('password')
        });

        const {error} = registerSchema.validate(req.body);
        //2. ErrorHandling in validation via middleware
        if(error){
            return next(error);
        }
        //3. ErrorHandling if username or email already exists via middleware
        const {username,name,email,password}= req.body;

        try{
            const usernameInDb = await User.exists({username});
            const emailInDb = await User.exists({email});

            if(usernameInDb){
                error = {
                    status: 409,
                    message: "Username already Taken, please choose another"
                }
                return next(error);
            }
            if(emailInDb){
                error = {
                    status: 409,
                    message: "Email already Taken, please choose another"
                }
                return next(error);
            }
        }
        catch(error){
            return next(error);
        }

        //4. Password Hashed
        const hashedPassword = await bcrypt.hash(password,10);
        
        //5. Storing data in db
        let user,accessToken,refreshToken;
        try{
            const userToRegister = new User({
                username,
                name,
                email,
                password:hashedPassword
            }) 
    
            user = await userToRegister.save();
            //Generate Access Token and Refresh Token
            
            accessToken = await JWTServices.signAccessToken({_id:user._id},'30m');
            refreshToken = await JWTServices.signRefreshToken({_id:user._id},'60m');

        }
        catch(error){
            return next(error);
        }

        //Storing RefreshToken in Db
        await JWTServices.storeRefreshToken(refreshToken,user._id);

        //Sending Tokens to browser via cookies
        res.cookie('accessToken',accessToken,{
            maxAge: 1000*60*60*24,
            httpOnly:true
        });

        res.cookie('refreshToken', refreshToken,{
            maxAge:1000*60*60*24,
            httpOnly:true
        })

        const userDto = new UserDTO(user);
        //6. Send reponse
        return res.status(201).json({user:userDto,auth:true});
    },
    //Login function for logingIn user
    async login(req,res,next){
        //1. Validating User Input using Joi
        const loginSchema = Joi.object({
            username:Joi.string().min(5).max(30).required(),
            password:Joi.string().pattern(passwordPattern).required()
        });

        const {error} = loginSchema.validate(req.body);

        //2. ErrorHandling in validation using middleware
        if(error){
            return next(error);
        }
        //3. Match username and Password
        const {username,password} = req.body;
        let user,accessToken,refreshToken;

        try{
            user = await User.findOne({username});
            if(!user){
                const error = {
                    status:401,
                    message:"Invalid username!"
                }
                return next(error);
            }
            const match = await bcrypt.compare(password,user.password);
            if(!match){
                const error = {
                    status:401,
                    message:"Invalid Password!"
                }
                return next(error);
            }
        }
        catch(error){
            return next(error);
        }
        //Generate Access Token and Register Token
        accessToken = await JWTServices.signAccessToken({_id:user._id},'30m');
        refreshToken = await JWTServices.signRefreshToken({_id:user._id},'60m');

        await JWTServices.updateRefreshToken(refreshToken,user._id);

        res.cookie('accessToken', accessToken,{
            maxAge: 1000*60*60*24,
            httpOnly:true
        });
        res.cookie('refreshToken', refreshToken,{
            maxAge: 1000*60*60*24,
            httpOnly:true
        })

        const userDto = new UserDTO(user);
        //4. Response send
        return res.status(200).json({user:userDto,auth:true});

    },
    //Logout function for logingOut user
    async logout(req,res,next){
        //If we notice we haven't done any validation, we are validation in a central location using a middleware auth

        //1. Delete refresh token from db
        const {refreshToken} = req.cookies;
        try{
            await JWTServices.deleteRefreshToken(refreshToken);
        }
        catch(error){
            return next(error);
        }
        //2. Clear AccessToken and RefreshToken from cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        //3. Response
        res.status(200).json({user:null,auth:false});

    },
    //Refresh token to assign new access and refresh token and update refresh token in db
    async refresh(req,res,next){
        //1. Get refresh token from cookies
        const originalRefreshToken = req.cookies.refreshToken;
        //2. Verify refresh token
        let userId;
        try{
            userId = (await JWTServices.verifyRefreshToken(originalRefreshToken))._id;
        }catch(e){
            const error = {
                status:401,
                message:"Unauthorize"
            };
            return next(error);
        }
        //3. Match userId and token 
        try{
            const match = await RefreshToken.findOne({token:originalRefreshToken,userId:userId});
            if(!match){
                const error = {
                    status:401,
                    message:"Not matched Unauthorize"
                }
                return next(error);
            }
        }
        catch(e){
            return next(e);
        }
        //4. Generate new tokens
        const accessToken = await JWTServices.signAccessToken({_id:userId},'30m');
        const refreshToken = await JWTServices.signRefreshToken({_id:userId},'60m');
        //5. Update db
        await JWTServices.updateRefreshToken(refreshToken,userId);
        //6. Return response
        res.cookie('accessToken',accessToken,{
            maxAge:1000*60*60*24,
            httpOnly:true
        })
        res.cookie('refreshToken',refreshToken,{
            maxAge:1000*60*60*24,
            httpOnly:true
        })
        const user = await User.findOne({_id:userId});

        const userDto = new UserDTO(user);

        res.status(200).json({user:userDto, auth:true});
    },
}

module.exports = authController;