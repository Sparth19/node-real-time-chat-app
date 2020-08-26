const socket = io()

socket.on('message', (msg) => {
    console.log(msg)
})

document.querySelector('#msgform').addEventListener('submit', (e) => {
    e.preventDefault()
    const text = document.getElementById('inputtext')
    socket.emit('sendmsg', text.value)
})