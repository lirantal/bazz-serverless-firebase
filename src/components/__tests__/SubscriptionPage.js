import React from 'react'
import {mount, shallow} from 'enzyme'

import SubscriptionPage from '../SubscriptionPage'

test('SubscriptionPage renders success page', () => {
  const page = mount(<SubscriptionPage />)

  expect(page.text()).toEqual(
    expect.stringContaining(`I will send you a notification when it's time.`)
  )
  page.unmount()
})
