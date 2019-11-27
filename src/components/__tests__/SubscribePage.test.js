import React from 'react'
import {mount, shallow} from 'enzyme'

import SubscribePage from '../SubscribePage'

// Imported for mocks
import {subscribePush, sendSubscription, requestNotificationPermission} from '../../helpers/pushApi'

jest.mock('../../helpers/pushApi.js', () => {
  return {
    subscribePush: jest.fn(() => Promise.resolve()),
    sendSubscription: jest.fn(() => Promise.resolve()),
    requestNotificationPermission: jest.fn(() => Promise.resolve())
  }
})

test('Subscribe page renders a notify me button', () => {
  const page = mount(<SubscribePage onSubscribe={() => {}} />)

  expect(page.text()).toEqual(expect.stringContaining('Notify me!'))
  page.unmount()
})

test('Subscribe page accepts a callback function for when the user subscribes', () => {
  const onSubscribeMock = jest.fn()
  const page = mount(<SubscribePage onSubscribe={onSubscribeMock} />)

  expect(page.prop('onSubscribe')).toEqual(onSubscribeMock)
  page.unmount()
})

test('Subscribe page renders a notify me button', () => {
  const page = mount(<SubscribePage onSubscribe={() => {}} />)

  const b = page.find('Button').filter({className: 'my-subscribe-button'})
  expect(b.text()).toEqual('Notify me!')
  page.unmount()
})

test('Subscribe page calls subscribeUser handler upon clicked', () => {
  const onSubscribeMock = jest.fn()
  const page = mount(<SubscribePage onSubscribe={onSubscribeMock} />)

  page.instance().subscribeUser = jest.fn()
  page.update()

  const b = page.find('Button').filter({className: 'my-subscribe-button'})
  b.simulate('click', {preventDefault() {}})

  expect(page.instance().subscribeUser).toHaveBeenCalled()
  page.unmount()
})

test('Subscribe page calls onSubscribe provided callback with error when notifications are not allowed', async () => {
  requestNotificationPermission.mockImplementationOnce(() => Promise.reject())

  const onSubscribeMock = jest.fn()
  const page = mount(<SubscribePage onSubscribe={onSubscribeMock} />)

  await page.instance().subscribeUser()
  expect(onSubscribeMock).toHaveBeenCalledWith({
    failure: 'blocked'
  })
  page.unmount()
})

test('Subscribe page calls onSubscribe provided callback with error when fails to subscribe to push notification', async () => {
  subscribePush.mockImplementationOnce(() =>
    Promise.reject({allowed: false, reason: 'unsupported'})
  )

  const onSubscribeMock = jest.fn()
  const page = mount(<SubscribePage onSubscribe={onSubscribeMock} />)

  await page.instance().subscribeUser()
  expect(onSubscribeMock).toHaveBeenCalledWith({
    failure: 'unsupported'
  })
  page.unmount()
})

test('Subscribe page calls onSubscribe provided callback with error when fails to send subscription', async () => {
  sendSubscription.mockImplementationOnce(() => Promise.reject({allowed: false}))

  const onSubscribeMock = jest.fn()
  const page = mount(<SubscribePage onSubscribe={onSubscribeMock} />)

  await page.instance().subscribeUser()
  expect(onSubscribeMock).toHaveBeenCalledWith({
    failure: 'server'
  })
  page.unmount()
})

test('Subscribe page calls onSubscribe provided callback successfully', async () => {
  const onSubscribeMock = jest.fn()
  const page = mount(<SubscribePage onSubscribe={onSubscribeMock} />)

  await page.instance().subscribeUser()
  expect(onSubscribeMock).toHaveBeenCalledWith({
    subscription: undefined
  })
  page.unmount()
})
