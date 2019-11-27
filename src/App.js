import React, {Component} from 'react'

import {getSubscription, sendSubscription, checkBrowerCapabilities} from './helpers/pushApi'
import {getToken} from './helpers/util'
import errors from './common/errors'

import ErrorPage from './components/ErrorPage'
import LoadingPage from './components/LoadingPage'
import SubscribePage from './components/SubscribePage'
import SubscriptionPage from './components/SubscriptionPage'

import {Divider, Segment, Label, Container, Header} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      failure: undefined,
      subscription: undefined,
      promptSubsubscription: undefined
    }
  }

  /**
   * Callback handler for the action when user subscribes
   */
  handleSubscribe = data => {
    if (!data) {
      return this.setPageError()
    }

    if (data.failure) {
      return this.setPageError(data.failure)
    }

    if (data.subscription) {
      return this.setState({
        failure: undefined,
        subscription: data.subscription,
        promptSubsubscription: undefined
      })
    }
  }

  setPageError = failure => {
    return this.setState({
      isLoading: false,
      failure: failure || errors['error'],
      promptSubsubscription: undefined,
      subscription: undefined
    })
  }

  /**
   * Begin browser detection and support for push subscription
   * that may already exist in the user's browser
   */
  async componentDidMount() {
    const token = getToken()
    if (!token) {
      return this.setPageError('token')
    }

    // per docs, the promise at `navigator.serviceWorker.ready`
    // never rejects and must resolve or run endlessly
    const capabilities = await checkBrowerCapabilities()

    if (!capabilities) {
      return this.setPageError()
    }

    if (capabilities.allowed === false && capabilities.reason) {
      return this.setPageError(capabilities.reason)
    }

    // subscription is an object with members of endpoint and keys
    const subscription = await getSubscription()

    // if we have a push subscription, we can register on the application server
    if (subscription) {
      try {
        await sendSubscription(subscription, getToken())
        return this.setState({
          isLoading: false,
          failure: undefined,
          subscription: subscription,
          promptSubsubscription: undefined
        })
      } catch (error) {
        return this.setPageError('server')
      }
    } else {
      return this.setState({
        isLoading: false,
        failure: undefined,
        promptSubsubscription: true
      })
    }
  }

  render() {
    return (
      <div>
        <Segment inverted textAlign="center" style={{minHeight: 700, padding: '1em 0em'}} vertical>
          <Container text>
            <Header
              as="h5"
              content="nice to meet you"
              inverted
              style={{
                fontSize: '1em',
                fontWeight: 'normal',
                marginBottom: '0',
                marginTop: '2em'
              }}
            />
            <Label as="a" size="huge" style={{marginTop: '0.5em'}} image>
              <img src="./elliot.jpg" alt="my name is bazz" />
              I'm bazz
            </Label>
          </Container>
          <Divider inverted style={{paddingTop: '1.2em'}} />
          <Divider horizontal inverted>
            your friendly bot
          </Divider>
          {<LoadingPage isLoading={this.state.isLoading} />}
          {<ErrorPage failure={this.state.failure} />}
          {this.state.subscription && <SubscriptionPage subscription={this.state.subscription} />}
          {this.state.promptSubsubscription === true && (
            <SubscribePage onSubscribe={this.handleSubscribe} />
          )}
        </Segment>
      </div>
    )
  }
}

export default App
