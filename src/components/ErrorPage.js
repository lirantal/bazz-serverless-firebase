import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Message, Segment} from 'semantic-ui-react'
import errors from '../common/errors'

class ErrorPage extends Component {
  render() {
    // this.props.failure can be one of:
    // * 'unsupported' - no support from browser
    // * 'blocked' - notifications blocked in browser
    // * 'server' - app server error subscription post error
    // * 'token' - invalid/non-existent use of token
    if (!this.props.failure) {
      return <div />
    }

    return (
      <Segment inverted basic style={{marginTop: '7em'}}>
        <Message negative>
          <Message.Header>Oh my!</Message.Header>
          <p>{errors[this.props.failure] || errors['error']}</p>
        </Message>
      </Segment>
    )
  }
}

ErrorPage.propTypes = {
  failure: PropTypes.string
}

export default ErrorPage
