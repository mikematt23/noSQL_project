const express = require('express');
const path = require('path')
const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')

const db = require('./data/database');
const routes = require("./routes/siteRoutes");
const { localsName } = require('ejs');
const { nextTick } = require('process');

const app = express()

const mongoStore = MongoDbStore(session)

const sessionStore = new mongoStore({
  uri: 'mongodb://localhost:27017',
  databaseName : "myTestSite",
  collection : "sessions"
})

app.set("view engine", "ejs")
app.set('views', path.join(__dirname, 'views'));


app.use(session({
  secret:"this is it",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {}
}))


app.use(express.urlencoded({extended:false}))
app.use(express.static('public'))

app.use(async (req,res,next)=>{
   const loggedIn = req.session.loggedIn
   const nav = req.session.nav

   if(!loggedIn){
    return next()
   }
   res.locals.loggedIn = loggedIn
   res.locals.nav = nav
   next()
 
})

app.use(routes)

db.connectToDatabase().then(()=>{
  app.listen(3001)
})