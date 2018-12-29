const redeemCode = require('./helpers/redeem-code')
const updateBalance = require('./helpers/update-balance')

/**
 * @api {post} /code-redeem Add funds to wallet - Code
 * @apiDescription Needs firebase authentication
 * @apiGroup Endpoints
 * 
 * @apiParam {String} code Code to redeem
 * @apiSuccessExample {json} Success
 * {
	"message": "Payment completed",
	"expiresOn": null,
	"purchaseDate": 1532560005885,
	"paymentId": "CODE_REDEEMED"
}
 */
module.exports = (req, res, next) => {
    // Handles new Masternode orders
    try {
        let code = req.body.code
        
        redeemCode({
                email: req.user.email,
                code
            }, (err, data) => {
                if (err) {
                    return res.status(400).send({
                        error: true,
                        message: 'Invalid code'
                    })
                }


                updateBalance(req.user.uid, data.chargeAmount, (err) => {
                    if (err) {
                        return res.status(400).send({
                            error: true,
                            message: 'Error updating balance. Contact support'
                        })
                    }
                });

                return res.send({
                    message: 'Payment completed',
                    expiresOn: new Date().setMonth(new Date().getMonth() + parseInt(data.months)),
                    purchaseDate: Date.now(),
                    paymentId: code
                })
            })
        
    } catch (err) {
        return next(err)
    }

}
