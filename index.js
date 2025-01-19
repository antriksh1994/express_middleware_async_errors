const express = require('express')
const app = express()
const morgan = require('morgan')
const AppError = require('./AppError')

app.use(morgan('tiny'))

app.use((req, res, next) => {
    req.requestTime = Date.now()
    console.log('FIRST MIDDLEWARE!!!')
    console.log(req.method, req.path)
    // next will invoke the next matching middleware or the next matching route
    return next()
    // console.log('FIRST MIDDLEWARE AFTER NEXT!!!')
})
app.use((req, res, next) => {
    console.log(`REQUEST DATE 1: ${req.requestTime}`)
    console.log('SECOND MIDDLEWARE!!')
    return next()
    // console.log('SECOND MIDDLEWARE AFTER NEXT!!!')
})
app.use((req, res, next) => {
    console.log(`REQUEST DATE 2: ${req.requestTime}`)
    console.log('THIRD MIDDLEWARE!!')
    return next()
    // console.log('THIRD MIDDLEWARE AFTER NEXT!!!')
})
app.use('/dogs', (req, res, next) => {
    console.log('I LOVE DOGS!!')
    next()
})
app.get('/', (req, res) => {
    res.send('Home Page!!')
})

app.get('/dogs', (req, res, next) => {
    // res.send will stop the cycle
    res.send('Woof Woof!!')
})
app.get('/error', (req, res, next) => {
    chicken.fly()
})
app.get('/admin',(req, res, next) => {
    throw new AppError('YOU ARE NOT AN ADMIN', 403)
})
// this will only run if we do not match any previous route
app.use((req, res, next) => {
    console.log('NOT FOUND');
   res.status(404).send('NOT FOUND!!')
})
app.use((error, req, res, next) => {
    console.log('==errr===', error)
    const { status = 500 } = error
    const { message = 'SOMETHING WENT WRONG' } = error
    res.status(status).send(message)
    console.log('*****************************');
    console.log('*********ERRRORR**************');
    console.log('*****************************');
    // next(error)
//    res.status(404).send('NOT FOUND!!')
})
app.listen(3000, ()=> {
    console.log('EXPRESS APP IS LISTENING!!')
})
