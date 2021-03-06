const express = require('express')
const path = require('path')
const session = require('express-session')

//-- Express --------------------------------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production')
    require('dotenv').config() // devDependency to setup .env locally
const app = express()
const PORT = process.env.PORT
const server = require('http').Server(app)
const io = require('socket.io')(server)
//-------------------------------------------------------------------------------------------------------------

//-- Body parser ----------------------------------------------------------------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.json());
//-------------------------------------------------------------------------------------------------------------

//-- Set Session Cookies ---------------------------------------------------------------------------------------
app.use(session({
    name: 'sessionID',
    secret: 'winterrunfarmhulkyolkmarinaetymologycors',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    resave: true,
    saveUninitialized: false
}))
//-------------------------------------------------------------------------------------------------------------

//-- Logger ---------------------------------------------------------------------------------------------------
const morgan = require('morgan')
const cors = require('cors')
if (process.env.NODE_ENV !== 'production') {
    app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
    app.use(morgan('dev'))
}
//-------------------------------------------------------------------------------------------------------------

//-- Socket ---------------------------------------------------------------------------------------------------
io.on('connection', socket => {
    socket.on('join-bidding', data => {
        socket.join(data.resource)
    })
    socket.on('leave-bidding', data => {
        socket.leave(data.resource)
    })
})
//-------------------------------------------------------------------------------------------------------------

//-- Code start here ------------------------------------------------------------------------------------------
app.use('/api', (req, res, next) => {
    req.io = io
    next()
}, require('./api'))
//-------------------------------------------------------------------------------------------------------------

//-- Heroku ---------------------------------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function (_req, res) {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}
//-------------------------------------------------------------------------------------------------------------

server.listen(PORT, () => console.log(`Knowledge Bytes running at ${PORT}`))