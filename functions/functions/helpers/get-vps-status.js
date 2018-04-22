const fs = require('fs')
const async = require('async')
const Client = require('ssh2').Client

const destroyTempKey = require('./destroy-temp-key')
const makeConfig = require('./make-config')
const decrypt = require('./decrypt')
const generateRandomString = require('../../endpoints/helpers/generate-random-pwd')

module.exports = (obj, cb) => {
    const {ip, encryptedSsh, typeLength} = obj
    const conn = new Client()

    async.waterfall([
        cb => {
            const sshKey = decrypt(typeLength, encryptedSsh)
            const sshKeyName = generateRandomString() + '.pem'

            fs.appendFile('/tmp/' + sshKeyName, sshKey, (error) => {
                if (error) {
                    return cb(error)
                }

                const keyPath = '/tmp/' + sshKeyName

                return cb(null, {
                    sshKey,
                    sshKeyName,
                    keyPath
                })
            })
        },
        (sshData, cb) => {
            conn.on('ready', () => {
                conn.exec('./syscoin2/src/syscoin-cli masternode status', (err, stream) => {
                    if (err) {
                        return cb(err)
                    }

                    stream.on('data', data => {
                        conn.end()

                        cb(null, JSON.parse(data.toString()))
                    }).stderr.on('data', error => {
                        conn.end()

                        cb(error)
                    })
                })
            }).connect({
                host: ip,
                port: 22,
                username: 'root',
                privateKey: fs.readFileSync(sshData.keyPath)
            })
        }
    ], (err, data) => {
        if (err) {
            return cb(err)
        }
        return cb(null, data)
    })
}