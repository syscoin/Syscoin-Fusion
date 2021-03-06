// @flow
import React, { Component  } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'
import { ipcRenderer, remote } from 'electron'
import Wallet from 'fw-components/Wallet'
import {
  saveAliases,
  saveBlockchainInfo,
  dashboardTransactions,
  checkWalletEncryption,
  getWalletBalance,
} from 'fw-actions/wallet'
import { saveGuids, toggleMaximize } from 'fw-actions/options'
import replaceColorPalette from 'fw-utils/replace-color-palette'
import { getAssetInfo, stop } from 'fw-sys'

import loadCustomCss from 'fw-utils/load-css'
import loadConf from 'fw-utils/load-conf-into-dev'
import getPaths from 'fw-utils/get-doc-paths'

type Props = {
  isMaximized: boolean,
  getWalletBalance: Function,
  saveAliases: Function,
  saveGuids: Function,
  saveBlockchainInfo: Function,
  toggleMaximize: Function,
  dashboardTransactions: Function,
  checkWalletEncryption: Function,
  t: Function
};

class WalletContainer extends Component<Props> {
  props: Props;

  componentWillMount() {
    loadCustomCss(getPaths().customCssPath)
    loadConf(getPaths().confPath, () => {
      ipcRenderer.on('maximize', () => {
        this.props.toggleMaximize(true)
      })
      ipcRenderer.on('unmaximize', () => {
        this.props.toggleMaximize(false)
      })
  
      this.props.toggleMaximize(remote.getCurrentWindow().isMaximized())
      replaceColorPalette()
      this.updateAssets()
    })
  }

  componentDidMount() {
    window.max = this.onMaximize

    if (!window.updateWalletHigh) {
      window.updateWalletHigh = setInterval(() => this.updateWalletHigh(), 5000)
    }
    
    this.updateWalletHigh()

    // Get Dashboard data
    this.props.dashboardTransactions(0)
  }

  updateWalletHigh() {
    this.props.saveAliases()
    this.props.saveBlockchainInfo()
    this.props.checkWalletEncryption()
    this.props.getWalletBalance()
  }

  async updateAssets() {
    let guids = window.appStorage.get('guid') || []

    guids = guids.filter(i => i !== 'none')

    guids = guids.map(i => getAssetInfo(i))

    try {
      guids = await Promise.all(guids)
    } catch(err) {
      guids = []
    }
    this.props.saveGuids(guids)
  }

  onMinimize() {
    ipcRenderer.send('minimize')
  }

  onClose() {
    ipcRenderer.on('close-sys', async () => {
      try {
        await stop()
      } catch (err) {
        console.log(err.message)
      }

      ipcRenderer.send('exit')
    })
    ipcRenderer.send('close')
  }

  onMaximize() {
    ipcRenderer.send('maximize')
  }
  
  onUnmaximize() {
    ipcRenderer.send('unmaximize')
  }

  render() {
    return (
      <Wallet
        isMaximized={this.props.isMaximized}
        onMinimize={this.onMinimize}
        onClose={this.onClose}
        onMaximize={this.onMaximize.bind(this)}
        onUnmaximize={this.onUnmaximize.bind(this)}
        t={this.props.t}
      />
    )
  }
}

const mapStateToProps = state => ({
  aliases: state.wallet.aliases,
  headBlock: state.wallet.blockchaininfo.headers,
  currentBlock: state.wallet.blockchaininfo.blocks,
  isMaximized: state.options.isMaximized
})

const mapDispatchToProps = dispatch => bindActionCreators({
  saveAliases,
  saveGuids,
  saveBlockchainInfo,
  toggleMaximize,
  dashboardTransactions,
  checkWalletEncryption,
  getWalletBalance
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(withNamespaces('translation')(WalletContainer))
