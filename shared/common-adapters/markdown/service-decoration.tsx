import React from 'react'
import * as Types from '../../constants/types/chat2'
import * as WalletTypes from '../../constants/types/wallets'
import * as RPCChatTypes from '../../constants/types/rpc-chat-gen'
import * as Styles from '../../styles'
import {toByteArray} from 'base64-js'
import PaymentStatus from '../../chat/payments/status/container'
import Mention from '../mention-container'
import Channel from '../channel-container'
import MaybeMention from '../../chat/conversation/maybe-mention'
import Text from '../text'
import {StyleOverride} from '.'

export type Props = {
  json: string
  onClick?: () => void
  allowFontScaling?: boolean | null
  message?: Types.MessageText
  styleOverride: StyleOverride
  styles: {[K in string]: Styles.StylesCrossPlatform}
}

const ServiceDecoration = (props: Props) => {
  // Parse JSON to get the type of the decoration
  let parsed: RPCChatTypes.UITextDecoration
  try {
    const json = Buffer.from(toByteArray(props.json)).toString()
    parsed = JSON.parse(json)
  } catch (e) {
    return null
  }
  if (parsed.typ === RPCChatTypes.UITextDecorationTyp.payment && parsed.payment && props.message) {
    let paymentID: WalletTypes.PaymentID
    let error
    if (
      parsed.payment.result.resultTyp === RPCChatTypes.TextPaymentResultTyp.sent &&
      parsed.payment.result.sent
    ) {
      paymentID = WalletTypes.rpcPaymentIDToPaymentID(parsed.payment.result.sent)
    } else if (
      parsed.payment.result.resultTyp === RPCChatTypes.TextPaymentResultTyp.error &&
      parsed.payment.result.error
    ) {
      error = parsed.payment.result.error
    } else {
      error = 'unknown text decoration'
    }
    return (
      <PaymentStatus
        paymentID={paymentID}
        error={error}
        text={parsed.payment.paymentText}
        allowFontScaling={props.allowFontScaling}
        message={props.message}
      />
    )
  } else if (parsed.typ === RPCChatTypes.UITextDecorationTyp.atmention && parsed.atmention) {
    return (
      <Mention
        allowFontScaling={props.allowFontScaling || false}
        style={props.styles.wrapStyle}
        username={parsed.atmention}
      />
    )
  } else if (parsed.typ === RPCChatTypes.UITextDecorationTyp.maybemention && parsed.maybemention) {
    return (
      <MaybeMention
        allowFontScaling={props.allowFontScaling || false}
        style={props.styles.wrapStyle}
        name={parsed.maybemention.name}
        channel={parsed.maybemention.channel}
      />
    )
  } else if (parsed.typ === RPCChatTypes.UITextDecorationTyp.link && parsed.link) {
    return (
      <Text
        className="hover-underline"
        type="BodyPrimaryLink"
        style={Styles.collapseStyles([props.styles.wrapStyle, linkStyle, props.styleOverride.link])}
        title={parsed.link.display}
        onClickURL={parsed.link.url}
        onLongPressURL={parsed.link.url}
      >
        {parsed.link.display}
      </Text>
    )
  } else if (parsed.typ === RPCChatTypes.UITextDecorationTyp.mailto && parsed.mailto) {
    return (
      <Text
        className="hover-underline"
        type="BodyPrimaryLink"
        style={Styles.collapseStyles([props.styles.wrapStyle, linkStyle, props.styleOverride.mailto])}
        title={parsed.mailto.display}
        onClickURL={parsed.mailto.url}
        onLongPressURL={parsed.mailto.url}
      >
        {parsed.mailto.display}
      </Text>
    )
  } else if (
    parsed.typ === RPCChatTypes.UITextDecorationTyp.channelnamemention &&
    parsed.channelnamemention
  ) {
    return (
      <Channel
        allowFontScaling={props.allowFontScaling || false}
        convID={parsed.channelnamemention.convID}
        name={parsed.channelnamemention.name}
        style={props.styles.linkStyle}
      />
    )
  }
  return null
}

const linkStyle = Styles.platformStyles({
  isElectron: {
    fontWeight: 'inherit',
  },
  isMobile: {
    fontWeight: undefined,
  },
})

export default ServiceDecoration
