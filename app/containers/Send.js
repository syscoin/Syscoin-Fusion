// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withNamespaces } from 'react-i18next'

import Send from 'fw-components/Send'
import {
  editSendAsset,
  editSendSys,
  sendAssetForm,
  sendSysForm,
  getAssetsFromAlias,
  changeFormTab
} from 'fw-actions/forms'
import unlockWallet from 'fw-utils/unlock-wallet'
import isSegwit from 'fw-sys/is-segwit'


type Props = {
  balance: number,
  addresses: Array<Object>,
  sendAssetForm: Function,
  sendSysForm: Function,
  editSendAsset: Function,
  editSendSys: Function,
  sysForm: Object,
  assetForm: Object,
  isEncrypted: boolean,
  getAssetsFromAlias: Function,
  changeFormTab: Function,
  activeTab: string,
  t: Function
};

type sendSysType = {
  amount: string,
  address: string,
  comment: string
};

class SendContainer extends Component<Props> {

  sendAsset() {
    return new Promise(async (resolve, reject) => {
      let lock = () => {}

      if (this.props.isEncrypted) {
        try {
          lock = await unlockWallet()
        } catch(err) {
          return reject(err)
        }
      }

      try {
        await this.props.sendAssetForm()
      } catch (err) {
        lock()
        return reject(err)
      }

      lock()
      resolve()
    })
  }

  sendSys(obj: sendSysType) {
    return new Promise(async (resolve, reject) => {
      let lock = () => {}

      if (this.props.isEncrypted) {
        try {
          lock = await unlockWallet()
        } catch(err) {
          return reject(err)
        }
      }
      
      try {
        await this.props.sendSysForm(obj)
      } catch (err) {
        return reject(err)
      }

      lock()
      resolve()
    })
  }

  async getAssetsFromAlias(alias: string) {
    this.props.getAssetsFromAlias(alias)
  }

  onChangeForm(obj: Object, type: string) {
    if (type === 'asset') {
      this.props.editSendAsset(obj)
    } else if (type === 'sys') {
      this.props.editSendSys(obj)
    }
  }

  render() {
    const {balance} = this.props
    return (
      <Send
        changeTab={this.props.changeFormTab}
        activeTab={this.props.activeTab}
        balance={balance}
        addresses={this.props.addresses}
        isSegwit={isSegwit}
        sendAsset={this.sendAsset.bind(this)}
        sendSys={this.sendSys.bind(this)}
        getAssetsFromAlias={this.getAssetsFromAlias.bind(this)}
        assetsForm={this.props.assetForm}
        sysForm={this.props.sysForm}
        onChangeForm={this.onChangeForm.bind(this)}
        t={this.props.t}
      />
    )
  }
}

const mapStateToProps = state => ({
  balance: state.wallet.balance,
  addresses: state.wallet.aliases,
  assetForm: state.forms.sendAsset,
  sysForm: state.forms.sendSys,
  isEncrypted: state.wallet.isEncrypted,
  activeTab: state.forms.sendTab.activeTab
})

const mapDispatchToProps = dispatch => bindActionCreators({
  editSendAsset,
  editSendSys,
  sendAssetForm,
  sendSysForm,
  getAssetsFromAlias,
  changeFormTab
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(withNamespaces('translation')(SendContainer))
