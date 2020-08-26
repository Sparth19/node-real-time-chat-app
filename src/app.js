const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
} = require('./utils/users')
const port = process.env.PORT

const publicPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {

        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('message', generateMessage("Admin", "Welcome !")) //emits to single connection
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", user.username + ' has joined !'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendmsg', (msg, callback) => {

        const user = getUser(socket.id)
        if (!user) {
            return callback('User not found')
        }

        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profane words not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, msg)) //emits to all connections
        callback()
    })

    socket.on('sendLocation', ({ lat, long }, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback('User not found')
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, "https://www.google.com/maps?q=" + lat + "," + long))
        callback('Location shared..')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.emit('message', generateMessage("Admin", user.username + ' has left !'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log('Server is on | ' + port)
})