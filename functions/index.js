'use strict'

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: functions.config().projectconfig.databaseurl
})
const express = require('express')
const cookieParser = require('cookie-parser')()
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

// Endpoints
const createNode = require('./endpoints/create-node')
const hostingSignup = require('./endpoints/hosting-signup')
const getUserNodes = require('./endpoints/get-user-nodes')
const testDeplots = require('./endpoints/test-deploys')
const coinbasePostback = require('./endpoints/coinbase-postback')

// Listeners
const writeConfigToDroplet = require('./functions').writeConfigToDroplet
const editNodeData = require('./functions').editNodeData
const emailUserOnStatusChange = require('./functions').emailUserOnStatusChange
const emailOnDeploy = require('./functions').emailOnDeploy

// Tasks
const startUpdateStatusQueue = require('./functions/status-queue')
const processOrder = require('./functions/process-order')
const unlockDeploys = require('./functions/unlock-orders')
const deleteDeployLogs = require('./functions/deploy-queue-cleaner')
const unlockVpsStatus = require('./functions/vps-status-queue-cleaner')

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = (req, res, next) => {

	if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
		!req.cookies.__session) {
		res.status(403).send('Unauthorized')
		return
	}

	let idToken
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
		// Read the ID Token from the Authorization header.
		idToken = req.headers.authorization.split('Bearer ')[1]
	} else {
		// Read the ID Token from cookie.
		idToken = req.cookies.__session
	}
	admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
		req.user = decodedIdToken
		return next()
	}).catch((error) => {
		res.status(403).send('Unauthorized')
	})
}

app.use(cors())
app.use(cookieParser)
app.use(bodyParser.json())
//app.get('/test/deploys', testDeplots)
app.post('/payment', validateFirebaseIdToken, createNode)
app.post('/signup', hostingSignup)
app.post('/coinbase-postback', coinbasePostback)
app.get('/nodes', validateFirebaseIdToken, getUserNodes)

app.use((err, req, res, next) => {
	console.log(err)
	return res.status(500).send('Something went wrong')
})

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.app = functions.https.onRequest(app)

exports.writeConfigToDroplet = writeConfigToDroplet
exports.editNodeData = editNodeData
exports.emailUserOnStatusChange = emailUserOnStatusChange
exports.emailOnDeploy = emailOnDeploy

exports.startUpdateStatusQueue = startUpdateStatusQueue
exports.processOrder = processOrder
exports.deleteDeployLogs = deleteDeployLogs
exports.unlockDeploys = unlockDeploys
exports.unlockVpsStatus = unlockVpsStatus
