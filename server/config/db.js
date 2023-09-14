const mongoose = require('mongoose');
const  connectDB = async ()=>{
    try {
        mongoose.set('strictQuery',false)
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/BlogNodeJS')
        console.log(`Database connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB