// @flow
import React from 'react'
import { Icon } from 'antd'

type Props = {
  onClick: Function,
  disabled: boolean
};

export default (props: Props) => {
  const { onClick, disabled, ...otherProps } = props
  console.log(disabled)
  return <Icon type='home' onClick={onClick} {...otherProps} className={`home-icon ${disabled ? 'disabled' : ''} ${otherProps.className}`} />
}