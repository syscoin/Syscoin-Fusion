// @flow
import { createAction } from 'redux-actions'
import * as types from 'fw-types/forms'
import {
  sendAsset,
  sendSysTransaction,
  getAssetBalancesByAddress
} from 'fw-sys'

type editSendAssetActionType = {
  type: string,
  payload?: editSendAssetType
};

type editSendAssetType = {
  from: string,
  asset: string,
  toAddress: string,
  amount: string,
  comment?: string
};

type editSendSysActionType = {
  type: string,
  payload?: editSendSysType
};

type editSendSysType = {
  comment?: string,
  address: string,
  amount: string
};

export const editSendAssetAction = createAction(types.EDIT_SEND_ASSET_FORM)
export const editSendSysAction = createAction(types.EDIT_SEND_SYS_FORM)

export const sendAssetIsLoadingAction = createAction(types.SEND_ASSET_IS_LOADING)
export const sendAssetErrorAction = createAction(types.SEND_ASSET_ERROR)
export const sendAssetReceiveAction = createAction(types.SEND_ASSET_RECEIVE)

export const getAssetsFromAliasIsLoadingAction = createAction(types.GET_ASSETS_FROM_ALIAS_IS_LOADING)
export const getAssetsFromAliasErrorAction = createAction(types.GET_ASSETS_FROM_ALIAS_ERROR)
export const getAssetsFromAliasReceivedAction = createAction(types.GET_ASSETS_FROM_ALIAS_RECEIVE)

export const sendSysIsLoadingAction = createAction(types.SEND_SYS_IS_LOADING)
export const sendSysErrorAction = createAction(types.SEND_SYS_ERROR)
export const sendSysReceiveAction = createAction(types.SEND_SYS_RECEIVE)

export const changeFormTabAction = createAction(types.CHANGE_FORM_TAB)

export const changeToolsAssetAction = createAction(types.CHANGE_ASSET_TOOLS_ACTION)
export const changeToolsAssetUpdateGuid = createAction(types.CHANGE_ASSET_TOOLS_UPDATE_GUID)

export const changeToolsAssetFormField = createAction(types.CHANGE_ASSET_TOOLS_FORM_FIELD)
export const resetToolsAssetForm = createAction(types.RESET_TOOLS_ASSET_FORM)

export const changeFormTab = (val, tab) => dispatch => {
  dispatch(changeFormTabAction({ val, tab }))
}

export const editSendAsset = (obj: editSendAssetType) => (dispatch: (action: editSendAssetActionType) => void) => dispatch(editSendAssetAction(obj))
export const editSendSys = (obj: editSendSysType) => (dispatch: (action: editSendSysActionType) => void) => dispatch(editSendSysAction(obj))

export const sendAssetForm = () => async (dispatch: (action: editSendAssetActionType) => void, getState: Function) => {
  const { from, toAddress, asset, amount, comment } = getState().forms.sendAsset.data
  dispatch(sendAssetIsLoadingAction())

  try {
    dispatch(
      sendAssetReceiveAction(
        await sendAsset({
          amount,
          comment,
          fromAlias: from,
          toAlias: toAddress,
          assetId: asset
        })
      )
    )
  } catch (err) {
    dispatch(sendAssetErrorAction(err.message))
    return Promise.reject(err)
  }

  return Promise.resolve()
}

export const sendSysForm = (obj: editSendSysType) => async (dispatch: (action: editSendSysActionType) => void) => {
  dispatch(sendSysIsLoadingAction())

  try {
    dispatch(sendSysReceiveAction(await sendSysTransaction(obj)))
  } catch (err) {
    dispatch(sendSysErrorAction(err))
    return Promise.reject(err)
  }

  return Promise.resolve()
}

export const getAssetsFromAlias = (address) => async (dispatch: (action: Array<Object>) => void, getState: Function) => {
  const limitToAssets = getState().options.guids.map(i => i.asset_guid)
  let assets
  dispatch(getAssetsFromAliasIsLoadingAction())

  try {
    assets = await getAssetBalancesByAddress(address)
    if (limitToAssets.length) {
      assets = assets.filter(i => limitToAssets.indexOf(i.asset_guid) !== -1)
    }
  } catch(err) {
    dispatch(getAssetsFromAliasErrorAction(err))
  }

  dispatch(getAssetsFromAliasReceivedAction(assets))
}
