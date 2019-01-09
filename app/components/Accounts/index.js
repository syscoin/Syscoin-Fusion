// @flow
import React, { Component } from 'react'
import { Row, Col, Icon, Spin } from 'antd'
import AssetBox from './components/asset-box'
import Dashboard from './components/dashboard'
import AssetDetails from './components/asset-details'
import Panel from './components/panel'

type Props = {
  backgroundLogo: string,
  balance: number,
  aliases: Array<Object>,
  transactions: Object,
  selectedAlias: string,
  aliasAssets: {
    selected: string,
    selectedSymbol: string,
    isLoading: boolean,
    data: Array<any>,
    error: boolean
  },
  updateSelectedAlias: Function,
  selectAsset: Function,
  headBlock: number,
  currentBlock: number,
  syncPercentage: number,
  getAliasInfo: Function,
  getPrivateKey: Function,
  goToHome: Function,
  dashboardSysTransactions: {
    isLoading: boolean,
    error: boolean,
    data: Array<Object>
  },
  dashboardAssets: {
    isLoading: boolean,
    error: boolean,
    data: Array<Object>
  },
  getDashboardAssets: Function,
  getDashboardTransactions: Function,
  goToAssetForm: Function,
  goToSysForm: Function,
  claimInterest: Function,
  claimAllInterestFromAsset: Function,
  t: Function
};

export default class Accounts extends Component<Props> {
  props: Props;

  refreshDashboardAssets() {
    this.props.getDashboardAssets()
  }

  refreshDashboardTransactions() {
    this.props.getDashboardTransactions()
  }

  goToSendAssetForm(asset: string) {
    this.props.goToAssetForm(asset, this.props.selectedAlias)
  }

  render() {
    const { t } = this.props
    return (
      <Row className='accounts-container'>
        <Panel
          t={t}
          aliases={this.props.aliases}
          aliasAssets={this.props.aliasAssets}
          transactions={this.props.transactions}
          currentBalance={this.props.balance}
          goToHome={this.props.goToHome}
          syncPercentage={this.props.syncPercentage}
          headBlock={this.props.headBlock}
          currentBlock={this.props.currentBlock}
          updateSelectedAlias={this.props.updateSelectedAlias}
          claimInterest={this.props.claimInterest}
          selectedAlias={this.props.selectedAlias}
          getPrivateKey={this.props.getPrivateKey}
        />
        <Col xs={15} className='accounts-container-right'>
          {(!this.props.selectedAlias || this.props.aliasAssets.error) ? (
            <Dashboard
              balance={this.props.balance}
              backgroundLogo={this.props.backgroundLogo}
              transactions={this.props.dashboardSysTransactions}
              assets={this.props.dashboardAssets}
              refreshDashboardAssets={this.refreshDashboardAssets.bind(this)}
              refreshDashboardTransactions={this.refreshDashboardTransactions.bind(this)}
              goToSysForm={this.props.goToSysForm}
              claimAllInterestFromAsset={this.props.claimAllInterestFromAsset}
              t={t}
            />
          ) : null}
          <AssetDetails
            t={t}
            aliasAssets={this.props.aliasAssets}
            selectAsset={this.props.selectAsset}
            goToSendAssetForm={this.goToSendAssetForm.bind(this)}
            selectedAlias={this.props.selectedAlias}
            claimInterest={this.props.claimInterest}
            transactions={this.props.transactions}
          />
          {this.props.aliasAssets.isLoading &&
            <div className='loading-container'>
              <Spin indicator={<Icon type='loading' spin />} />
            </div>
          }
        </Col>
      </Row>
    )
  }
}
