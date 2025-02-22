import * as React from 'react'
import * as Kb from '../../common-adapters'
import * as Constants from '../../constants/tracker2'
import * as Types from '../../constants/types/tracker2'
import * as Styles from '../../styles'
import {chunk} from 'lodash-es'
import Bio from '../../tracker2/bio/container'
import Assertion from '../../tracker2/assertion/container'
import Actions from './actions/container'
import Friend from './friend/container'
import Measure from './measure'
import Teams from './teams/container'
import Folders from '../folders/container'
import shallowEqual from 'shallowequal'
import * as RPCTypes from '../../constants/types/rpc-gen'
import * as Flow from '../../util/flow'

export type BackgroundColorType = 'red' | 'green' | 'blue'

export type Props = {
  assertionKeys: Array<string> | null
  backgroundColorType: BackgroundColorType
  followThem: boolean
  followers: Array<string> | null
  followersCount: number
  following: Array<string> | null
  followingCount: number
  notAUser: boolean
  onAddIdentity: () => void | null
  onBack: () => void
  onReload: () => void
  onSearch: () => void
  onEditAvatar: () => void | null
  reason: string
  state: Types.DetailsState
  suggestionKeys: Array<string> | null
  userIsYou: boolean
  username: string
}

const colorTypeToStyle = (type: 'red' | 'green' | 'blue') => {
  switch (type) {
    case 'red':
      return styles.typedBackgroundRed
    case 'green':
      return styles.typedBackgroundGreen
    case 'blue':
      return styles.typedBackgroundBlue
    default:
      Flow.ifFlowComplainsAboutThisFunctionYouHaventHandledAllCasesInASwitch(type)
      return styles.typedBackgroundRed
  }
}

const BioLayout = p => (
  <Kb.Box2 direction="vertical" style={styles.bio}>
    <Kb.ConnectedNameWithIcon
      username={p.username}
      underline={false}
      selectable={true}
      colorFollowing={true}
      notFollowingColorOverride={p.notAUser ? Styles.globalColors.black_50 : Styles.globalColors.orange}
      editableIcon={!!p.onEditAvatar}
      onEditIcon={p.onEditAvatar}
      avatarSize={avatarSize}
      size="huge"
    />
    <Kb.Box2 direction="vertical" fullWidth={true} gap="small">
      <Bio inTracker={false} username={p.username} />
      <Actions username={p.username} />
    </Kb.Box2>
  </Kb.Box2>
)

const Proofs = p => {
  let assertions
  if (p.assertionKeys) {
    assertions = [
      ...p.assertionKeys.map(a => <Assertion key={a} username={p.username} assertionKey={a} />),
      ...(p.suggestionKeys || []).map(s => (
        <Assertion isSuggestion={true} key={s} username={p.username} assertionKey={s} />
      )),
    ]
  } else {
    assertions = null
  }

  let proveIt = null

  if (p.notAUser) {
    const [name, service] = p.username.split('@')
    proveIt = (
      <Kb.Text type="BodySmall" style={styles.proveIt}>
        Tell {name} to join Keybase and prove their {service}.
      </Kb.Text>
    )
  }

  return (
    <Kb.Box2 direction="vertical" fullWidth={true}>
      {assertions}
      {proveIt}
    </Kb.Box2>
  )
}

type FriendshipTabsProps = {
  loading: boolean
  onChangeFollowing: (arg0: boolean) => void
  selectedFollowing: boolean
  numFollowers: number
  numFollowing: number
}

class FriendshipTabs extends React.Component<FriendshipTabsProps> {
  _onClickFollowing = () => this.props.onChangeFollowing(true)
  _onClickFollowers = () => this.props.onChangeFollowing(false)
  _tab = following => (
    <Kb.ClickableBox
      onClick={following ? this._onClickFollowing : this._onClickFollowers}
      style={Styles.collapseStyles([
        styles.followTab,
        following === this.props.selectedFollowing && styles.followTabSelected,
      ])}
    >
      <Kb.Text
        type="BodySmallSemibold"
        style={
          following === this.props.selectedFollowing ? styles.followTabTextSelected : styles.followTabText
        }
      >
        {following
          ? `Following${!this.props.loading ? ` (${this.props.numFollowing})` : ''}`
          : `Followers${!this.props.loading ? ` (${this.props.numFollowers})` : ''}`}
      </Kb.Text>
    </Kb.ClickableBox>
  )

  render() {
    return (
      <Kb.Box2 direction="horizontal" style={styles.followTabContainer} fullWidth={true}>
        {this._tab(false)}
        {this._tab(true)}
      </Kb.Box2>
    )
  }
}

const widthToDimentions = width => {
  const singleItemWidth = Styles.isMobile ? 130 : 120
  const itemsInARow = Math.floor(Math.max(1, width / singleItemWidth))
  const itemWidth = Math.floor(width / itemsInARow)
  return {itemWidth, itemsInARow}
}

type FriendRowProps = {
  usernames: Array<string>
  itemWidth: number
}

class FriendRow extends React.Component<FriendRowProps> {
  shouldComponentUpdate(nextProps: FriendRowProps) {
    return (
      this.props.itemWidth !== nextProps.itemWidth || !shallowEqual(this.props.usernames, nextProps.usernames)
    )
  }

  render() {
    return (
      <Kb.Box2 direction="horizontal" fullWidth={true} style={styles.friendRow}>
        {this.props.usernames.map(u => (
          <Friend key={u} username={u} width={this.props.itemWidth} />
        ))}
      </Kb.Box2>
    )
  }
}

export type BioTeamProofsProps = {
  onAddIdentity: () => void | null
  assertionKeys: Array<string> | null
  backgroundColorType: BackgroundColorType
  onEditAvatar: () => void | null
  notAUser: boolean
  suggestionKeys: Array<string> | null
  username: string
  reason: string
}
export class BioTeamProofs extends React.PureComponent<BioTeamProofsProps> {
  render() {
    const addIdentity = this.props.onAddIdentity ? (
      <Kb.ButtonBar style={styles.addIdentityContainer}>
        <Kb.Button
          fullWidth={true}
          onClick={this.props.onAddIdentity}
          style={styles.addIdentityButton}
          mode="Secondary"
          label="Add more identities"
        >
          <Kb.Meta backgroundColor={Styles.globalColors.blue} title="NEW" style={styles.newMeta} />
        </Kb.Button>
      </Kb.ButtonBar>
    ) : null
    return Styles.isMobile ? (
      <Kb.Box2 direction="vertical" fullWidth={true} style={styles.bioAndProofs}>
        {!!this.props.reason && (
          <Kb.Text
            type="BodySmallSemibold"
            negative={true}
            center={true}
            style={Styles.collapseStyles([styles.reason, colorTypeToStyle(this.props.backgroundColorType)])}
          >
            {this.props.reason}
          </Kb.Text>
        )}
        <Kb.Box2 direction="vertical" fullWidth={true} style={{position: 'relative'}}>
          <Kb.Box2
            direction="vertical"
            fullWidth={true}
            style={Styles.collapseStyles([
              styles.backgroundColor,
              colorTypeToStyle(this.props.backgroundColorType),
            ])}
          />
        </Kb.Box2>
        <BioLayout {...this.props} />
        <Kb.Box2 direction="vertical" fullWidth={true} style={styles.proofsArea}>
          <Teams username={this.props.username} />
          <Proofs {...this.props} />
          {addIdentity}
          <Folders profileUsername={this.props.username} />
        </Kb.Box2>
      </Kb.Box2>
    ) : (
      <>
        <Kb.Box2
          direction="vertical"
          fullWidth={true}
          style={Styles.collapseStyles([
            styles.backgroundColor,
            colorTypeToStyle(this.props.backgroundColorType),
          ])}
        />
        <Kb.Box2 key="bioTeam" direction="horizontal" fullWidth={true} style={styles.bioAndProofs}>
          <BioLayout {...this.props} />
          <Kb.Box2 direction="vertical" style={styles.proofs}>
            <Kb.Text type="BodySmallSemibold" negative={true} center={true} style={styles.reason}>
              {this.props.reason}
            </Kb.Text>
            <Teams username={this.props.username} />
            <Proofs {...this.props} />
            {addIdentity}
            <Folders profileUsername={this.props.username} />
          </Kb.Box2>
        </Kb.Box2>
      </>
    )
  }
}

type State = {
  selectedFollowing: boolean
  width: number
}

class User extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedFollowing: !!usernameSelectedFollowing[props.username],
      width: Styles.dimensionWidth,
    }
  }

  _changeFollowing = following => {
    this.setState(p => {
      if (p.selectedFollowing === following) {
        return
      }
      const selectedFollowing = !p.selectedFollowing
      usernameSelectedFollowing[this.props.username] = selectedFollowing
      return {selectedFollowing}
    })
  }

  _renderSectionHeader = ({section}) => {
    if (section === this._bioTeamProofsSection) return null
    if (this.props.notAUser) return null

    const loading = !this.props.followers || !this.props.following
    return (
      <FriendshipTabs
        key="tabs"
        loading={loading}
        numFollowers={this.props.followersCount}
        numFollowing={this.props.followingCount}
        onChangeFollowing={this._changeFollowing}
        selectedFollowing={this.state.selectedFollowing}
      />
    )
  }

  _renderOtherUsers = ({item, section, index}) =>
    this.props.notAUser ? null : item.type === 'noFriends' || item.type === 'loading' ? (
      <Kb.Box2 direction="horizontal" style={styles.textEmpty} centerChildren={true}>
        <Kb.Text type="BodySmall">{item.text}</Kb.Text>
      </Kb.Box2>
    ) : (
      <FriendRow key={'friend' + index} usernames={item} itemWidth={section.itemWidth} />
    )

  _bioTeamProofsSection = {
    data: ['bioTeamProofs'],
    renderItem: () => (
      <BioTeamProofs
        onAddIdentity={this.props.onAddIdentity}
        assertionKeys={this.props.assertionKeys}
        backgroundColorType={this.props.backgroundColorType}
        username={this.props.username}
        reason={this.props.reason}
        suggestionKeys={this.props.suggestionKeys}
        onEditAvatar={this.props.onEditAvatar}
        notAUser={this.props.notAUser}
      />
    ),
  }

  _onMeasured = width => this.setState(p => (p.width !== width ? {width} : null))
  _keyExtractor = (item, index) => index

  componentDidUpdate(prevProps: Props) {
    if (this.props.username !== prevProps.username) {
      this.props.onReload()
    }
  }

  _errorFilter = e => e.code !== RPCTypes.StatusCode.scresolutionfailed

  render() {
    const friends = this.state.selectedFollowing ? this.props.following : this.props.followers
    const {itemsInARow, itemWidth} = widthToDimentions(this.state.width)
    // TODO memoize?
    let chunks: Array<
      Array<string> | {type: 'noFriends'; text: string} | {type: 'loading'; text: string}
    > = this.state.width ? chunk(friends, itemsInARow) : []
    if (chunks.length === 0) {
      if (this.props.following && this.props.followers) {
        chunks.push({
          text: this.state.selectedFollowing
            ? `${this.props.userIsYou ? 'You are' : `${this.props.username} is`} not following anyone.`
            : `${this.props.userIsYou ? 'You have' : `${this.props.username} has`} no followers.`,
          type: 'noFriends',
        })
      } else {
        chunks.push({
          text: 'Loading...',
          type: 'loading' as 'loading',
        })
      }
    }

    return (
      <Kb.Reloadable
        reloadOnMount={true}
        onReload={this.props.onReload}
        onBack={this.props.onBack}
        waitingKeys={[Constants.profileLoadWaitingKey]}
        errorFilter={this._errorFilter}
      >
        <Kb.Box2
          direction="vertical"
          fullWidth={true}
          fullHeight={true}
          style={Styles.collapseStyles([styles.container, colorTypeToStyle(this.props.backgroundColorType)])}
        >
          <Kb.Box2 direction="vertical" style={styles.innerContainer}>
            {!Styles.isMobile && <Measure onMeasured={this._onMeasured} />}
            <Kb.SafeAreaViewTop
              style={Styles.collapseStyles([colorTypeToStyle(this.props.backgroundColorType), styles.noGrow])}
            />
            {!!this.state.width && (
              <Kb.SectionList
                key={this.props.username + this.state.width /* forc render on user change or width change */}
                stickySectionHeadersEnabled={true}
                renderSectionHeader={this._renderSectionHeader}
                keyExtractor={this._keyExtractor}
                sections={[
                  this._bioTeamProofsSection,
                  {
                    data: chunks,
                    itemWidth,
                    renderItem: this._renderOtherUsers,
                  },
                ]}
                style={styles.sectionList}
                contentContainerStyle={styles.sectionListContentStyle}
              />
            )}
          </Kb.Box2>
        </Kb.Box2>
      </Kb.Reloadable>
    )
  }
}

// don't bother to keep this in the store
const usernameSelectedFollowing = {}

const avatarSize = 128
const headerHeight = Styles.isAndroid ? 30 : Styles.isIOS ? Styles.statusBarHeight + 46 : 80

export const styles = Styles.styleSheetCreate({
  addIdentityButton: {
    marginBottom: Styles.globalMargins.xsmall,
    marginTop: Styles.globalMargins.xsmall,
  },
  addIdentityContainer: Styles.platformStyles({
    common: {
      justifyContent: 'center',
    },
    isElectron: {
      paddingLeft: Styles.globalMargins.tiny,
      paddingRight: Styles.globalMargins.tiny,
    },
  }),
  backgroundColor: {
    ...Styles.globalStyles.fillAbsolute,
    bottom: undefined,
    height: avatarSize / 2,
  },
  bio: Styles.platformStyles({
    common: {alignSelf: 'flex-start'},
    isElectron: {marginBottom: Styles.globalMargins.small, width: 350},
    isMobile: {marginBottom: Styles.globalMargins.medium, width: '100%'},
  }),
  bioAndProofs: Styles.platformStyles({
    common: {
      justifyContent: 'space-around',
      paddingBottom: Styles.globalMargins.medium,
      position: 'relative',
    },
    isMobile: {paddingBottom: Styles.globalMargins.small},
  }),
  container: {
    paddingTop: headerHeight,
  },
  followTab: Styles.platformStyles({
    common: {
      alignItems: 'center',
      borderBottomColor: 'white',
      borderBottomWidth: 2,
      justifyContent: 'center',
    },
    isElectron: {
      borderBottomStyle: 'solid',
      height: 40,
      minWidth: 120,
    },
    isMobile: {
      borderRadius: 0,
      height: 48,
      width: '50%',
    },
  }),
  followTabContainer: Styles.platformStyles({
    common: {
      alignItems: 'flex-end',
      backgroundColor: Styles.globalColors.white,
      borderBottomColor: Styles.globalColors.black_10,
      borderBottomWidth: 1,
    },
    isElectron: {
      alignSelf: 'stretch',
      borderBottomStyle: 'solid',
    },
    isMobile: {
      width: '100%',
    },
  }),
  followTabSelected: {
    borderBottomColor: Styles.globalColors.blue,
  },
  followTabText: {color: Styles.globalColors.black_60},
  followTabTextSelected: {color: Styles.globalColors.black},
  friendRow: Styles.platformStyles({
    common: {
      maxWidth: '100%',
      minWidth: 0,
      paddingTop: Styles.globalMargins.tiny,
    },
    isElectron: {justifyContent: 'flex-start'},
    isMobile: {justifyContent: 'center'},
  }),
  innerContainer: {
    height: '100%',
    width: '100%',
  },
  invisible: {opacity: 0},
  label: {
    color: Styles.globalColors.black,
  },
  newMeta: Styles.platformStyles({
    common: {
      alignSelf: 'center',
      marginRight: Styles.globalMargins.tiny,
    },
    isMobile: {
      position: 'relative',
      top: -1,
    },
  }),
  noGrow: {flexGrow: 0},
  proofs: Styles.platformStyles({
    isElectron: {
      alignSelf: 'flex-start',
      flexShrink: 0,
      width: 350,
    },
    isMobile: {width: '100%'},
  }),
  proofsArea: Styles.platformStyles({
    isMobile: {
      paddingLeft: Styles.globalMargins.medium,
      paddingRight: Styles.globalMargins.medium,
    },
  }),
  proveIt: {
    paddingTop: Styles.globalMargins.small,
  },
  reason: Styles.platformStyles({
    isElectron: {
      height: avatarSize / 2 + Styles.globalMargins.small,
    },
    isMobile: {
      padding: Styles.globalMargins.tiny,
    },
  }),
  search: Styles.platformStyles({
    common: {
      backgroundColor: Styles.globalColors.black_10,
      borderRadius: Styles.borderRadius,
    },
    isElectron: {
      minHeight: 24,
      minWidth: 240,
    },
    isMobile: {
      minHeight: 32,
      minWidth: 200,
    },
  }),
  searchContainer: Styles.platformStyles({
    common: {
      alignItems: 'center',
      flexGrow: 1,
      justifyContent: 'center',
    },
    isElectron: {
      ...Styles.desktopStyles.clickable,
    },
  }),
  searchLabel: {color: Styles.globalColors.white_75},
  sectionList: Styles.platformStyles({
    common: {width: '100%'},
    isElectron: {
      backgroundColor: Styles.globalColors.white,
      position: 'relative',
      willChange: 'transform',
    },
  }),
  sectionListContentStyle: Styles.platformStyles({
    common: {backgroundColor: Styles.globalColors.white, paddingBottom: Styles.globalMargins.xtiny},
    isMobile: {minHeight: '100%'},
  }),
  teamLink: {color: Styles.globalColors.black},
  teamShowcase: {alignItems: 'center'},
  teamShowcases: {
    flexShrink: 0,
    paddingBottom: Styles.globalMargins.small,
  },
  textEmpty: {
    paddingBottom: Styles.globalMargins.large,
    paddingTop: Styles.globalMargins.large,
  },
  typedBackgroundBlue: {backgroundColor: Styles.globalColors.blue},
  typedBackgroundGreen: {backgroundColor: Styles.globalColors.green},
  typedBackgroundRed: {backgroundColor: Styles.globalColors.red},
})

export default User
