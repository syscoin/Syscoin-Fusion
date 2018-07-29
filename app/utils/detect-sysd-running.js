const OS = require('./detect-os')()
const { execSync } = require('child_process')

module.exports = (returnPid) => {
    let result
    if (OS === 'win') {
        result = execSync('tasklist | findstr /C:"syscoind.exe"').toString()
        return returnPid ? (/\d+/g).exec(result)[0] : (/syscoind\.exe\s+\d+/g).test(result)
    } else if (OS === 'osx') {
        result = execSync('ps -ax | grep syscoind').toString()
        result = result.split(/\r?\n/g).find(i => i.indexOf('mac/syscoind') !== -1)
        return returnPid ? (/\d+/).exec(result)[0] : !!result
    }
}
