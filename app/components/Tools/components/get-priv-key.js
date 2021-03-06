// @flow
import React, { Component } from 'react'
import { Button, Icon, Spin } from 'antd'
import swal from 'sweetalert'
import parseError from 'fw-utils/error-parser'

type Props = {
  getPrivateKey: Function
};
type State = {
  isLoading: boolean
};

export default class GetPrivateKey extends Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props)

    this.state = {
      isLoading: false
    }
  }

  getKey() {
    this.setState({
      isLoading: true
    })
    this.props.getPrivateKey((err, key) => {
      this.setState({
        isLoading: false
      })
      if (err) {
        return swal('Error', parseError(err.message), 'error')
      }

      return swal('Here is your key', key, 'success')
    })
  }

  render() {
    return (
      <div className='get-priv-key-container'>
        <h3 className='get-priv-key-title'>Get Private Key</h3>
        {this.state.isLoading ? (
          <Spin indicator={<Icon type='loading' className='loading-tools' spin />} />
        ) : (
          <Button className='get-priv-key-btn' disabled={this.state.isLoading} onClick={this.getKey.bind(this)}>Get Private Key</Button>
        )}
      </div>
    )
  }
}
