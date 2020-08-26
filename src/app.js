const express = require('express')
const app = express()
const hbs = require('hbs')
const path = require('path')

const publicPath = path.join(__dirname, '../public')
const viewPath = path.join(__dirname, '../templates/views')
    //const partialPath = path.join(__dirname, '../templates/partials')

app.use(express.static(publicPath))
app.set('views', viewPath)
app.set('view engine', 'hbs')
    //hbs.registerPartial(partialPath)

const port = process.env.PORT

app.get('', (req, res) => {
    res.render('index', {
        title: 'Chat App',
        body: 'Welcome !'
    })

})
app.listen(3000, () => {
    console.log('Server is on | ' + 3000)
})