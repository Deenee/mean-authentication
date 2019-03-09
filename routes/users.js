const express = require('express');
const router =  express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/database');

router.post('/register', (req, res, next)=>{

    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    });

    User.addUser(newUser, (err, user)=>{
        if(err){
            res.json({success:false, message: 'Failed to register user '});
            
        }else{
            res.json({success:true, message: 'User registered successfully'});
        }

    })
    // res.send('Register');
});

router.post('/authenticate', (req, res, next)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user)=>{
        if(err) throw err;
        
        if(!user){
            return res.json({success: false, message: 'User not found'});
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token= jwt.sign(user.toJSON(), config.secret,{
                    expiresIn: 604800 //week
                });

                res.json({
                    success:true,
                    message: 'User logged in successfully',
                    token:'Bearer ' + token,
                    user:{
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                });
                
            }else{
                 res.json({success: false, message: 'Wrong password'});
            }
            
        });
    });
});

router.get('/profile',passport.authenticate('jwt', {session:false}), (req, res, next)=>{
    res.send({user: req.user});
});

module.exports = router;
