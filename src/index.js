/* eslint-disable react/display-name */

import React from 'react'
export { default } from './ContentParser'

export const toSpreader = (SpreaderComponent, GroupComponent) => (
  instance,
  component,
  data,
  key,
) => {
  const Element = GroupComponent || instance.type
  return (
    <SpreaderComponent component={component} data={data} key={key}>
      {typeof instance === 'string' ? (
        instance
      ) : (
        <Element {...instance.props} />
      )}
    </SpreaderComponent>
  )
}
