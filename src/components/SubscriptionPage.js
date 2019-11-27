import React, {Component} from 'react'
import {Container, Icon, Message} from 'semantic-ui-react'

class SubscriptionPage extends Component {
  render() {
    // subscription data vailable in
    // this.props.subscription.endpoint
    return (
      <Container textAlign="center" style={{marginTop: '9em'}}>
        <Message icon color="green">
          <Icon name="hand spock" />
          <Message.Content>
            <p>You're all set!</p>
            <p>I will send you a notification when it's time.</p>
          </Message.Content>
        </Message>
      </Container>
    )
  }
}

export default SubscriptionPage
