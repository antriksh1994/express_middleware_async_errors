class AppError extends Error {
    constructor (message, status) {
        super()
        console.log('==4==', message)
        this.message = message
        this.status == status
    }
}
module.exports = AppError