import React from 'react'
import {mount, shallow} from 'enzyme'

import LoadingPage from '../LoadingPage'

test('Loader is active when being told to', () => {
  const page = mount(<LoadingPage isLoading />)

  expect(page.text()).toEqual(expect.stringContaining('fishing for browser support'))
  page.unmount()
})

test('Loader is active when being told to', () => {
  const page = mount(<LoadingPage isLoading={false} />)

  expect(page.text()).not.toEqual(expect.stringContaining('fishing for browser support'))
  page.unmount()
})
