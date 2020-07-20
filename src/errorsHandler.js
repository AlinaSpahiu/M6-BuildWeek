const handler = (err, req, res, next) => {
    // if (err.httpStatusCode === 400) {
    
    res.status(err.httpStatusCode).send(err.message)
    
    // }
}

module.exports = handler  