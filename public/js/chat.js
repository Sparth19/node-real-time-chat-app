const socket = io()

//Elements
const msgForm = document.querySelector('#msgform')
const msgSendBtn = document.querySelector('#send')
const text = document.getElementById('inputtext')
const locSendBtn = document.getElementById('send-location')
const message = document.getElementById('message')

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML

socket.on('message', (msgObject) => {
    console.log(msgObject)
    const html = Mustache.render(messageTemplate, {
        message: msgObject.text,
        createdAt: moment(msgObject.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML('beforeend', html)

})

socket.on('locationMessage', (locMsgObject) => {
    console.log(locMsgObject)
    const html = Mustache.render(locationTemplate, {
        url: locMsgObject.url,
        createdAt: moment(locMsgObject.createdAt).format('h:mm a')
    })
    message.insertAdjacentHTML('beforeend', html)
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