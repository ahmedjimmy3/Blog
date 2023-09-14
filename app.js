require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const mongoStore = require('connect-mongo');
const session = require('express-session');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers')

const app = express();
const PORT  = 5000 || process.env.PORT

// connect to db
connectDB();

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())
app.use(methodOverride('_method'))

app.use(session({
    secret: 'Keyboard cat',
    resave: false,
    saveUninitialized:true,
    store:mongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/BlogNodeJS',
    }),

}))

app.use(express.static('public'));

// Templating engine
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine' , 'ejs');


app.locals.isActiveRoute = isActiveRoute;


app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));



app.listen(PORT,()=>{
    console.log(`App Listening on port ${PORT}`);
})

