const mongoose = require('mongoose')

require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI);

const session = require('express-session');
const express = require('express')
const app = express()

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

//session
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {

        maxAge: 1000 * 60 * 60 * 24, // Set session cookie to expire in 1 day
    }
}));

const adminRoute = require('./routes/adminRoute')
const userRoute = require('./routes/userRoute');

app.use('/admin', adminRoute)
app.use('/', userRoute)

app.listen(3000, () => {
    console.log("server started")
})