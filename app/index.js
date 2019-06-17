/* eslint import/first:0 */
require('dotenv').config()

import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Root from './containers/Root'
import { store, history } from './store/configureStore'
import Storage from './utils/storage'
import storageSchema from './utils/helpers/storage-schema'
import attachWindowListeners from 'fw-utils/listeners'
import pushToLogs from 'fw-utils/push-to-logs'
import attachNotifications from 'fw-utils/attach-notifications'

import pushNotification from 'fw-utils/push-notification'
import './app.global.scss'
import 'fw-utils/i18n'

// App storage setup
global.appStorage = new Storage({
  configName: 'app-storage',
  defaults: { ...storageSchema }
})

attachNotifications(process.env.ZMQ_LISTEN, (ev, data) => {
  const transaction = JSON.parse(data.toString())
  const transactionEvent = new CustomEvent('transaction_notification', { detail: transaction })

  document.dispatchEvent(transactionEvent)

  pushNotification(transaction)
})

// Log all errors to debug.log
window.onerror = err => pushToLogs(err)

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
)

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root') // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    )
  })
}

attachWindowListeners()
