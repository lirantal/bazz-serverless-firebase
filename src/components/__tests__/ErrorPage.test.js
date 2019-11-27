import React from 'react'
import {mount, shallow} from 'enzyme'

import ErrorPage from '../ErrorPage'
import errors from '../../common/errors'

test('ErrorPage renders with text corresponding to a failure reason', () => {
  const page = mount(<ErrorPage failure="token" />)

  expect(page.text()).toContain(errors['token'])
  page.unmount()
})

test('ErrorPage does not render anything if no failure prop provided', () => {
  const page = mount(<ErrorPage />)

  expect(page.text()).toBeFalsy()
  page.unmount()
})

test('ErrorPage without a known failure reason will default to a generic error message', () => {
  const page = mount(<ErrorPage failure="somethingsomething" />)
  expect(page.text()).toContain(errors['error'])
  page.unmount()
})
