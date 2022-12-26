const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser')
const passport = require('./config/passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();

// charging static files
app.use(express.static('public'));

// enable pug
app.set('view engine', 'pug');

// Folder Views added
app.set('views', path.join(__dirname, './views'))

// able body parser to read inputs
app.use(bodyParser.urlencoded({extended: true}))

app.use(cookieParser());

// hold the session 
app.use(session({
    secret: 'supersecret',
    resave: false,
    saveUninitialized: false
}))

// authenticate the user
app.use(passport.initialize());
app.use(passport.session());

// giving the user to the app
app.use((req, res, next) => {
    res.locals.user = {...req.user} || null; 
    next();
})

// listening routes
app.use('/', routes())

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor corriendo correctamente en el puerto: ${port}`)
})

