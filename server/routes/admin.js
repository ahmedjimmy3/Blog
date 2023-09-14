const express = require('express')
const router  = express.Router();
const Post = require('../models/post')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const  adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET



// check login
const authMiddleWare = (req,res,next)=>{
    const token  = req.cookies.token

    if(!token){
        return res.status(401).json({message:'Unauthorized'})
    }
    
    try{
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId
        next()
    }
    catch(error){
        return res.status(401).json({message:'Unauthorized'})
    }
}










router.get('/admin', async(req,res)=>{
    try {
        const locals={
            title:"Admin",
            description:"Simple project."
        }

        res.render('admin/index',{ locals , layout:adminLayout})
    } catch (error) {
        console.log(error)
    }
})


// check login
router.post('/admin', async(req,res)=>{
    try {
        const {username, password} = req.body;
        
        const user = await User.findOne({ username })
        if(!user){
            return res.status(401).json({message:'Invalid credentials'})
        }
        const isPasswordValid = await bcrypt.compare(password , user.password)
        if(!isPasswordValid){
            return res.status(401).json({message:'Invalid credentials'})
        }

        const token = jwt.sign({userId: user._id} , jwtSecret)
        res.cookie('token', token, {httpOnly:true});

        res.redirect('/dashboard')

    } catch (error) {
        console.log(error) 
    }
})




router.get('/dashboard', authMiddleWare ,async(req,res)=>{

    try {
        const locals={
            title:"Admin",
            description:"Simple project."
        }
        const data =  await Post.find()
        res.render('admin/dashboard', {
            data,
            locals,
            layout:adminLayout
        })

    } catch (error) {
        
    }    
})


// admin-new posts
router.get('/add-post', authMiddleWare ,async(req,res)=>{

    try {
        const locals={
            title:"Add Post",
            description:"Simple project."
        }
        const data =  await Post.find()
        res.render('admin/add-post', {
            locals,
            layout:adminLayout
        })

    } catch (error) {
        
    }    
})

router.post('/add-post', authMiddleWare ,async(req,res)=>{

    try {
        const {title , body} = req.body
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            })
            await Post.create(newPost);
            res.redirect('/dashboard')
        }catch(error){
            console.log(error)
        }

    } catch (error) {
        console.log(error)
    }    
})



router.get('/edit-post/:id', authMiddleWare ,async(req,res)=>{
    try {
        const locals={
            title:"Edit Post",
            description:"Simple project."
        }
        const data = await Post.findOne({ _id:req.params.id })

        res.render('admin/edit-post',{
            data,
            locals,
            layout: adminLayout,
        })

    } catch (error) {
        console.log(error)
    }    
})



router.put('/edit-post/:id', authMiddleWare ,async(req,res)=>{
    try {
        await Post.findByIdAndUpdate(req.params.id , {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })

        res.redirect(`/edit-post/${req.params.id}`)

    } catch (error) {
        console.log(error)
    }    
})


router.delete('/delete-post/:id', authMiddleWare ,async(req,res)=>{
    try {
        await Post.deleteOne({ _id:req.params.id })
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }
})








// register
router.post('/register', async(req,res)=>{
    try {
        const {username, password} = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        try{
            const user = await User.create({username, password:hashPassword})
            res.status(201).json({message:'user Created',user})
        }catch(error){
            if(error.code===11000){
                res.status(409).json({message: 'user Already used'})
            }
            res.status(500).json({message: 'internal server error'}) 
        }

    } catch (error) {
        console.log(error) 
    }
})




// logout
router.get('/logout', (req,res)=>{
    res.clearCookie('token')
    // res.json({message:'Logout successfully:)'})
    res.redirect('/')
    
})



module.exports = router