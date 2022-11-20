const express = require('express')
const mongodb = require('mongodb')
const bcrypt = require('bcrypt')
const db = require("../data/database")
const session = require('express-session')

const router = express.Router()

const ObjectId = mongodb.ObjectId
//get routes
router.get("/",(req,res)=>{
  session.user = "test"
  res.render("home")
})

router.get("/signUp", (req,res)=>{
  res.render("sign-up")
})

router.get("/logIn", (req,res)=>{
  res.render("logIn")
})

router.get("/user", (req,res)=>{
  const user = req.session.user
  if(!req.session.loggedIn){
    return res.render('404')
  }
  res.render("user" ,{user: user})
})
router.get('/blog',async (req,res)=>{
  const posts = await db.getDb().collection('posts').find({}).toArray()
  res.render('blog', {posts})
})

router.get('/post/:postId',async(req,res)=>{
  const postId = req.params.postId
  const post = await db.getDb().collection('posts').find({_id:new ObjectId(postId)}).toArray()
  const comments = await db.getDb().collection('comments').find({postId: postId}).toArray()
  res.render('post',{post:post, comments: comments})
})

router.get("/admin", (req,res)=>{
  res.render("admin")
})

//post routes
router.post('/SignUp', async (req,res)=>{
  let email = req.body.email
  let password = req.body.Password
  const user = {
     firstName : req.body.fname,
     lastName : req.body.lname,
     email: email,
     password: '',
  }
 const userCheck = await db.getDb().collection('users').findOne({email: email})
 if(userCheck){
  res.redirect("/signUp")
  return
 }
 const hashedPassword = await bcrypt.hash(password, 10)
  user.password = hashedPassword
  await db.getDb().collection("users").insertOne(user)
  console.log(req.session)
  res.redirect("/logIn")

})

router.post("/login", async(req,res)=>{
  let email = req.body.userName

  isUserCheck = await db.getDb().collection('users').findOne({email: email})
 
  if(!isUserCheck){
    console.log("no user")
    res.redirect("/logIn")
    return
  }
 console.log(isUserCheck)
  req.session.user = isUserCheck
  req.session.loggedIn = true
  req.session.nav = true
  res.redirect('/user')
  
})

router.post("/posts",async(req,res)=>{
  const id = req.session.user._id
  const firstName = req.session.user.firstName
  const lastName = req.session.user.lastName
  const post = req.body.post

  await db.getDb().collection('posts').insertOne({post:post, userId:id, firstName: firstName, lastName:lastName})
  res.redirect('/user')
})

router.post('/postComment/:postId',async(req,res)=>{
  postId = req.params.postId
  comment = req.body.YourComment
  user = req.session.user._id
  console.log(comment)
  
  await db.getDb().collection('comments').insertOne({postId:postId, comment: comment, userId : user})
  res.redirect(`/post/${postId}`)
})

router.post('/logOut',(req,res)=>{
  req.session.loggedIn = false
  req.session.nav = false
  res.redirect('/logIn')
})
module.exports = router
