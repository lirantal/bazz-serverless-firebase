import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {subscribePush, sendSubscription, requestNotificationPermission} from '../helpers/pushApi'
import {getToken} from '../helpers/util'

import {Label, Button, Container, Header} from 'semantic-ui-react'

class SubscribePage extends Component {
  handleSubscribeClick = e => {
    e.preventDefault()
    this.subscribeUser()
  }

  /**
   * Handle user subscription flow, composed of:
   * - granted permission to browser notifications
   * - get subscription from push server
   * - send subscription to application server
   */
  subscribeUser = async () => {
    if (!this.props.onSubscribe || typeof this.props.onSubscribe !== 'function') {
      return false
    }

    try {
      await requestNotificationPermission()
    } catch (error) {
      return this.props.onSubscribe({
        failure: 'blocked'
      })
    }

    let subscription
    try {
      subscription = await subscribePush()
    } catch (error) {
      if (typeof error === 'object' && error.allowed === false) {
        return this.props.onSubscribe({
          failure: error.reason
        })
      }
    }

    try {
      await sendSubscription(subscription, getToken())
      return this.props.onSubscribe({
        subscription
      })
    } catch (error) {
      return this.props.onSubscribe({
        failure: 'server'
      })
    }
  }

  render() {
    return (
      <Container textAlign="center" style={{marginTop: '6em'}}>
        <Label basic size="medium" pointing="below">
          You need to hit the button so I can send you a notification when it's time.
        </Label>
        <Container>
          <Button
            positive
            size="massive"
            className="my-subscribe-button"
            onClick={this.handleSubscribeClick}
            style={{marginTop: '1em'}}
          >
            Notify me!
          </Button>
        </Container>
        <Container style={{marginTop: '6em'}}>
          <Header inverted as="h5" size="tiny">
            the browser will prompt you to enable notifications
          </Header>
        </Container>
      </Container>
    )
  }
}

SubscribePage.propTypes = {
  onSubscribe: PropTypes.func
}

export default SubscribePage
