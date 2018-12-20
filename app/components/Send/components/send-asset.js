// @flow
import React, { Component } from 'react'
import { Col, Input, Button, Select, Spin, Icon } from 'antd'
import formChangeFormat from 'fw-utils/form-change-format'

const { Option } = Select

type Props = {
  title: string,
  columnSize: number,
  aliases: Array<string>,
  isLoading: boolean,
  sendAsset: Function,
  onSelectAlias: Function,
  assetsFromAlias: {
    isLoading: boolean,
    error: boolean,
    data: Array<Object>
  },
  form: {
    isLoading: boolean,
    error: boolean,
    data: FormDataType
  },
  onChangeForm: Function
};

type FormDataType = {
  from: string,
  asset: string,
  toAddress: string,
  amount: string,
  comment: string
};

export default class SendAssetForm extends Component<Props> {

  updateField(value: string | Object, name: string, filter?: RegExp) {
    const toUpdate = formChangeFormat(value, name, filter)

    if (filter && !filter.test(toUpdate[name])) {
      if (toUpdate[name]) {
        return
      }
    }

    this.props.onChangeForm({
      ...this.props.form.data,
      ...toUpdate
    }, 'asset')
  }
  
  resetForm() {
    this.props.onChangeForm({
      ...this.initialState
    })
  }
  
  render() {
    const {
      title = 'Send Address',
      columnSize = 12,
      aliases = [],
      isLoading = false,
      sendAsset,
      assetsFromAlias,
      form
    } = this.props
    const {
      from,
      asset,
      toAddress,
      amount,
      comment
    } = form.data

    return (
      <Col
        xs={columnSize}
        offset={6}
        className='send-asset-container'
      >
        <div className='send-asset-form-container'>
          <h3 className='send-asset-form-title'>{title}</h3>
          <Select
            disabled={isLoading}
            onChange={val => {
              this.updateField(val, 'from')
              this.props.onSelectAlias(val)

              // Give some time to updateField to update "from" so it wont be empty when firing this
              setTimeout(() => this.updateField('', 'asset'), 200)
            }}
            placeholder='Select alias'
            className='send-asset-form-control send-asset-form-select-alias'
            id='asset-form-select-alias'
            value={from.length ? from : undefined}
          >
            {aliases.map(i => (
              <Option value={i} key={i}>
                {i}
              </Option>
            ))}
          </Select>
          <Select
            disabled={isLoading || assetsFromAlias.isLoading}
            onChange={val => this.updateField(val, 'asset')}
            placeholder='Select asset'
            className='send-asset-form-control send-asset-form-select-asset'
            id='asset-form-select-asset'
            value={asset.length ? asset : undefined}
          >
            {assetsFromAlias.data.map(i => (
              <Option value={i.asset} key={i.asset}>
                {i.symbol} - {i.asset}
              </Option>
            ))}
          </Select>
          {assetsFromAlias.isLoading && <Spin indicator={<Icon type='loading' spin />} className='assets-from-alias-loader' />}
          <Input
            disabled={isLoading}
            name='toAddress'
            placeholder='Send to address...'
            onChange={e => this.updateField(e, 'toAddress')}
            value={toAddress}
            className='send-asset-form-control send-asset-form-to-address'
            id='asset-form-to-address'
          />
          <Input
            disabled={isLoading}
            name='amount'
            placeholder='Amount'
            onChange={e => this.updateField(e, 'amount', /^\d+(\.)?(\d+)?$/)}
            value={amount}
            className='send-asset-form control send-asset-form-amount'
            id='asset-form-amount'
          />
          <Input
            disabled={isLoading}
            name='comment'
            placeholder='Comment'
            onChange={e => this.updateField(e, 'comment')}
            value={comment}
            className='send-asset-form control send-asset-form-comment'
            id='asset-form-comment'
          />
          <div className='send-asset-form-btn-container'>
            {isLoading && <Spin indicator={<Icon type='loading' spin />} className='send-loading' />}
            <Button
              className='send-asset-form-btn-send'
              disabled={isLoading || !from || !asset || !toAddress || !amount}
              onClick={() => sendAsset(this.props.form.data)}
            >
              Send
            </Button>
          </div>
        </div>
      </Col>
    )
  }
}