import React from 'react'
import ReactDOM from 'react-dom'
import {mount, shallow} from 'enzyme'

import App from '../App'

// Imported for mocks
import {getToken} from '../helpers/util'
import {getSubscription, sendSubscription, checkBrowerCapabilities} from '../helpers/pushApi'

jest.mock('../helpers/util.js', () => {
  return {
    getToken: jest.fn()
  }
})

jest.mock('../helpers/pushApi.js', () => {
  return {
    checkBrowerCapabilities: jest.fn(() => Promise.resolve()),
    getSubscription: jest.fn(() => Promise.resolve()),
    sendSubscription: jest.fn(() => Promise.resolve())
  }
})

test('App renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<App />, div)
})

test('App renders with expected header text', () => {
  const page = mount(<App />)

  let component
  component = page.find('Header')
  expect(component.text()).toEqual('nice to meet you')

  component = page.find('Label')
  expect(component.text()).toEqual("I'm bazz")

  page.unmount()
})

test('App defaults to error state when no token provided', () => {
  const page = mount(<App />)

  expect(page.state().failure).toEqual('token')
  page.unmount()
})

test('App defaults to error state when no token provided', () => {
  const page = mount(<App />)

  expect(page.state().failure).toEqual('token')
  page.unmount()
})

test('handling subscription sets an error state when subscription data is invalid', () => {
  const page = mount(<App />)

  page.instance().handleSubscribe()
  expect(page.state().failure).toBeTruthy()

  page.instance().handleSubscribe({failure: 'something'})
  expect(page.state().failure).toEqual('something')

  page.unmount()
})

test('handling subscription sets a valid subscription object', () => {
  const page = mount(<App />)

  page.instance().handleSubscribe({subscription: 'someObject'})
  expect(page.state().failure).toBeFalsy()
  expect(page.state().promptSubsubscription).toBeFalsy()
  expect(page.state().subscription).toEqual('someObject')
  page.unmount()
})

test('upon mounting show an error if browser capabilities fail ', async () => {
  getToken.mockImplementationOnce(() => {
    return {
      sub_id: '123',
      nonce: 'abc'
    }
  })

  checkBrowerCapabilities.mockImplementationOnce(() => {
    return Promise.resolve({
      allowed: false,
      reason: 'unsupported'
    })
  })

  const mockSetError = jest.fn()

  App.prototype.setPageError = mockSetError
  await App.prototype.componentDidMount()

  expect(mockSetError).toHaveBeenCalledWith('unsupported')
})

test('upon mounting sets subscription state if able to send subscription to remote server', async () => {
  getToken.mockImplementation(() => {
    return {
      sub_id: '123',
      nonce: 'abc'
    }
  })

  checkBrowerCapabilities.mockImplementationOnce(() => {
    return Promise.resolve({
      allowed: true
    })
  })

  const mockSubscriptionObject = {endpoint: 'https://www.example.com'}
  getSubscription.mockImplementation(() => {
    return mockSubscriptionObject
  })

  sendSubscription.mockImplementation(() => {
    return Promise.resolve()
  })

  const mockSetState = jest.fn()

  App.prototype.setState = mockSetState
  await App.prototype.componentDidMount()

  expect(mockSetState.mock.calls[0][0]).toEqual({
    isLoading: false,
    subscription: mockSubscriptionObject,
    promptSubsubscription: undefined
  })
})

test('upon mounting show a failure if unable to get subscription object properly', async () => {
  getToken.mockImplementation(() => {
    return {
      sub_id: '123',
      nonce: 'abc'
    }
  })

  checkBrowerCapabilities.mockImplementationOnce(() => {
    return Promise.resolve({
      allowed: true
    })
  })

  getSubscription.mockImplementation(() => {
    return false
  })

  const mockSetState = jest.fn()

  App.prototype.setState = mockSetState
  await App.prototype.componentDidMount()

  expect(mockSetState.mock.calls[0][0]).toEqual({
    isLoading: false,
    failure: undefined,
    promptSubsubscription: true
  })
})

test('upon mounting sets show failure if unable to send subscription', async () => {
  getToken.mockImplementation(() => {
    return {
      sub_id: '123',
      nonce: 'abc'
    }
  })

  checkBrowerCapabilities.mockImplementation(() => {
    return Promise.resolve({
      allowed: true
    })
  })

  const mockSubscriptionObject = {endpoint: 'https://www.example.com'}
  getSubscription.mockImplementation(() => {
    return Promise.resolve(mockSubscriptionObject)
  })

  sendSubscription.mockImplementation(() => {
    return Promise.reject(new Error('something went wrong'))
  })

  const mockSetError = jest.fn()

  App.prototype.setPageError = mockSetError
  await App.prototype.componentDidMount()

  expect(mockSetError).toHaveBeenCalledWith('server')
})
