const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const port = process.env.PORT

const publicPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))

let count = 0
io.on('connection', (socket) => {
    console.log('New Websocket connection')
    socket.emit('message', generateMessage("Welcome !")) //emits to single connection
    socket.broadcast.emit('message', generateMessage('A new user has joined..'))


    socket.on('sendmsg', (msg, callback) => {
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profane words not allowed')
        }
        io.emit('message', generateMessage(msg)) //emits to all connections
        callback()
    })

    socket.on('sendLocation', ({ lat, long }, callback) => {
        io.emit('locationMessage', generateLocationMessage("https://www.google.com/maps?q=" + lat + "," + long))
        callback('Location shared..')
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left..'))
    })

})



server.listen(port, () => {
    console.log('Server is on | ' + port)
})