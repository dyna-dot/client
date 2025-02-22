import React from 'react'
import {namedConnect} from '../../util/container'
import * as FsGen from '../../actions/fs-gen'

type OwnProps = {}

const mapStateToProps = state => ({})

const mapDispatchToProps = dispatch => ({
  refresh: () => dispatch(FsGen.createRefreshDriverStatus()),
})

const mergeProps = (s, d, o) => ({
  refresh: d.refresh,
})

type Props = {
  refresh: () => void
}

class Component extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.refresh()
  }
  render() {
    return null
  }
}

export default namedConnect(mapStateToProps, mapDispatchToProps, mergeProps, 'RefreshDriverStatusOnMount')(
  Component
)
