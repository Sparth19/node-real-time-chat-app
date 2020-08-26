const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')

const port = process.env.PORT

const publicPath = path.join(__dirname, '../public')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(publicPath))

let count = 0
io.on('connection', (socket) => {
    console.log('New Websocket connection')
    socket.emit('message', "Welcome !") //emits to single connection

    socket.on('sendmsg', (msg) => {
        io.emit('message', msg) //emits to all connections
    })

})

server.listen(port, () => {
    console.log('Server is on | ' + port)
})