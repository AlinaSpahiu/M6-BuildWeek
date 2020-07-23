const handler = (err, req, res, next) => {
    // if (err.httpStatusCode === 400) {
    // err.httpStatusCode = 500
    res.status(err.httpStatusCode || 500).send(err.message)
    
    // }
}

module.exports = handler  