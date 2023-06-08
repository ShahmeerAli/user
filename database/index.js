const mongoose = require('mongoose');
const {DB_CONNECTION_STRING} = require('../config/index');

const dbConnect = async()=>{
    try{
        const con = await mongoose.connect(DB_CONNECTION_STRING);
        console.log(`Database connected to Host: ${con.connection.host}`);
    }
    catch(error){
        console.log(`ERROR ${error}`);
    }
}

module.exports = dbConnect;