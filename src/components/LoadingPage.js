import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {Loader} from 'semantic-ui-react'

class LoadingPage extends Component {
  render() {
    if (!this.props.isLoading) {
      return <div />
    }

    return (
      <Loader style={{marginTop: '2em'}} size="large" active={this.props.isLoading} inverted>
        <div>fishing for browser support...</div>
      </Loader>
    )
  }
}

LoadingPage.propTypes = {
  isLoading: PropTypes.bool
}

export default LoadingPage
