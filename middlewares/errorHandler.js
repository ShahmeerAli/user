const {ValidationError} = require('joi');

const errorHandler = (error,req,res,next) => {
    //Default error
    let status = 500;
    let data = {message:'Internal Server Error'};

    //Checking if validation Error
    if(error instanceof ValidationError){
        status=401,
        data.message=error.message;
        return res.status(status).json(data);
    }

    if(error.status){
        status= error.status;
    }
    if(error.message){
        data.message=error.message;
    }

    return res.status(status).json(data);

}

module.exports = errorHandler;