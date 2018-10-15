import fs from 'fs'
import each from 'async/each'

export default (confPath: string, cb: Function) => {
    let conf
  
    try {
      conf = fs.readFileSync(confPath, 'utf-8')
    } catch (e) {
      cb(e)
      throw new Error('Error while loading fusion.conf. Directory exists?')
    }

    each(conf.split('\r\n'), (i, done) => {
      // Parses fusion.cfg
      const trimmed = i.trim()
  
      if (trimmed[0] === '#' || !trimmed) {
        // Ignore comments and empty lines
        return
      }
  
      // Parses keys and values
      const key = trimmed.split('=')[0]
      const value = trimmed.split('=')[1].split(',')
  
      // Write the key/value pair into environment variables
      global.appStorage.set(key, value === 'none' ? [] : value)

      done()
    }, () => {
      cb()
    })
  }