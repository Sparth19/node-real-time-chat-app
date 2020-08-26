const socket = io()

//Elements
const msgForm = document.querySelector('#msgform')
const msgSendBtn = document.querySelector('#send')
const text = document.getElementById('inputtext')
const locSendBtn = document.getElementById('send-location')
const message = document.getElementById('message')
const sidebar = document.getElementById('sidebar')

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML


//query string
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

//auto scrolling
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msgObject) => {
    // console.log(msgObject)
    const html = Mustache.render(messageTemplate, {
        username: msgObject.username,
        message: msgObject.text,
        createdAt: moment(msgObject.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML('beforeend', html)
        //autoscroll()

})

socket.on('locationMessage', (locMsgObject) => {
    // console.log(locMsgObject)
    const html = Mustache.render(locationTemplate, {
        username: locMsgObject.username,
        url: locMsgObject.url,
        createdAt: moment(locMsgObject.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML('beforeend', html)
        // autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html

})

msgForm.addEventListener('submit', (e) => {
    e.preventDefault()
        //disable btn
    msgSendBtn.setAttribute('disabled', 'disabled')
    socket.emit('sendmsg', text.value, (error) => {
        //enable
        msgSendBtn.removeAttribute('disabled')
        text.value = ''
        text.focus()

        if (error) {
            return console.log(error)
        }
        console.log('msg delivered..')
    })
})

locSendBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser..')
    }
    //disable
    locSendBtn.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, (msg) => {
            //enable
            locSendBtn.removeAttribute('disabled')
            console.log(msg)
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})