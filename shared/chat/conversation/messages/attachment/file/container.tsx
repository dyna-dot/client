import * as Types from '../../../../../constants/types/chat2'
import * as FsGen from '../../../../../actions/fs-gen'
import * as Chat2Gen from '../../../../../actions/chat2-gen'
import {connect, isMobile} from '../../../../../util/container'
import {globalColors} from '../../../../../styles'
import File from '.'

const mapStateToProps = state => ({})

type OwnProps = {
  message: Types.MessageAttachment
}

const mapDispatchToProps = dispatch => ({
  _onDownload: (message: Types.MessageAttachment) => {
    dispatch(
      Chat2Gen.createAttachmentDownload({
        message,
      })
    )
  },
  _onShowInFinder: (message: Types.MessageAttachment) => {
    message.downloadPath &&
      dispatch(FsGen.createOpenLocalPathInSystemFileManager({localPath: message.downloadPath}))
  },
})

const mergeProps = (stateProps, dispatchProps, ownProps: OwnProps) => {
  const message = ownProps.message
  const arrowColor = message.downloadPath
    ? globalColors.green
    : message.transferState === 'downloading'
    ? globalColors.blue
    : ''
  const progressLabel =
    message.transferState === 'downloading'
      ? 'Downloading'
      : message.transferState === 'uploading'
      ? 'Uploading'
      : message.transferState === 'mobileSaving'
      ? 'Saving...'
      : message.transferState === 'remoteUploading'
      ? 'waiting...'
      : ''
  const hasProgress =
    !!message.transferState &&
    message.transferState !== 'remoteUploading' &&
    message.transferState !== 'mobileSaving'
  return {
    arrowColor,
    errorMsg: message.transferErrMsg || '',
    hasProgress,
    onDownload: !isMobile && !message.downloadPath ? () => dispatchProps._onDownload(message) : null,
    onShowInFinder: !isMobile && message.downloadPath ? () => dispatchProps._onShowInFinder(message) : null,
    progress: message.transferProgress,
    progressLabel,
    title: message.title || message.fileName,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(File)
