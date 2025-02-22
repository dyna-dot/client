import {remoteConnect, compose, renderNothing, branch} from '../util/container'
import * as RPCTypes from '../constants/types/rpc-gen'
import * as PinentryGen from '../actions/pinentry-gen'
import Pinentry from './index.desktop'

type OwnProps = {}

type State = {
  showTyping: RPCTypes.Feature
  type: RPCTypes.PassphraseType
  prompt: string
  retryLabel?: string
  submitLabel?: string
  sessionID: number
}

// Props are handled by remote-proxy.desktop.js
const mapDispatchToProps = dispatch => ({
  _onCancel: (sessionID: number) => dispatch(PinentryGen.createOnCancel({sessionID})),
  _onSubmit: (password: string, sessionID: number) =>
    dispatch(PinentryGen.createOnSubmit({password, sessionID})),
})
const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  onCancel: () => dispatchProps._onCancel(stateProps.sessionID),
  onSubmit: (password: string) => dispatchProps._onSubmit(password, stateProps.sessionID),
  ...ownProps,
})
export default compose(
  remoteConnect(state => state, mapDispatchToProps, mergeProps),
  branch((props: any) => !props.type, renderNothing)
)(Pinentry)
