const User = require('../models/signin');
const jwt = require('jsonwebtoken')
require('dotenv').config();

const authentication = async (req,res,next)=>{
    try{
        const token = req.header('Authorization');
        //const row = localStorage.getItem('row')
        const row = req.header('row')
        const userobj = jwt.verify(token , process.env.SECRET_TOKEN)
        const user = await User.findByPk(userobj.UserId);
        if(user){
            req.user = user;
            req.row = row;
            next();
        }else{
            throw new Error('something went wrong')
        }
    }catch(err){
        console.log(err)
        res.status(401).json({message: err})
    }
}

module.exports = {
    authentication
}