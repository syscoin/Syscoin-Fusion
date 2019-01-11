const admin = require('firebase-admin')

/**
 * @api {post} /droplets/edit-status Edit MN status
 * @apiDescription Goes through API filter - Edits MN status shown in UI.
 * @apiGroup Droplets Endpoints
 * 
 * @apiParam {String} status New status
 * @apiParam {Object} info getinfo output
 * @apiSuccessExample {json} Success
 *  {
 *      error: false,
 *      message: `Status updated to ${status}`
 *  }
 * 
 */
module.exports = (req, res, next) => {
    const clientIp = (req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress).split(",")[0]

    const { status, info } = req.body

    admin.database().ref('/vps/' + req.orderData.vpsId).update({
        status,
        info: getinfo
    }).then(() => res.send({
        error: false,
        message: `Status updated to "${status}"`
    })).catch(() => res.status(500).send({
        error: true,
        message: 'Internal Server Error.'
    }))
}
