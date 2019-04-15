import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { paramCase } from 'change-case'

const componentType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  component: PropTypes.string,
  props: PropTypes.object,
})

export default class ContentParser extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(componentType).isRequired,
    components: PropTypes.object,
    options: PropTypes.shape({
      pad: PropTypes.string,
      element: PropTypes.bool,
      CustomElement: PropTypes.bool,
    }),
    spreader: PropTypes.func,
  }

  static defaultProps = {
    data: [],
    components: {},
    options: {
      element: true,
      CustomElement: false,
    },
  }

  constructor(props) {
    super(props)

    const { components, options, spreader } = props
    const pad = `${(options.pad && `${options.pad}-`) || ''}`

    const getRenderChild = (spreader = comp => comp) => (availableComp = {}) =>
      function renderChild(child) {
        if (typeof child === 'object') {
          const { component, key, props: childProps } = child
          const Component =
            availableComp[component] ||
            (component.search(/[A-Z]+/) < 0 &&
              (((options.CustomElement && component.search(/-+/) >= 0) ||
                options.element) &&
                component))

          if (!Component) {
            console.error(
              `${component} can not be rendered: \n it is not an available component.`,
            )
          }

          const { children, ...otherProps } = childProps

          let childsComponent = null

          if (typeof children === 'object') {
            childsComponent = [].concat(children).map(renderChild)
          }

          return Component
            ? spreader(
                <Component key={key} {...otherProps}>
                  {childsComponent || children}
                </Component>,
                Component,
                child,
                key,
              )
            : null
        }

        return child
      }

    const paramCaseComponents = Object.entries(components).reduce(
      (acc, [key, comp]) => {
        const paramKey = paramCase(key)
        return {
          ...acc,
          [`${(!/-/i.test(paramKey) && pad) || ''}${paramKey}`]: comp,
        }
      },
      {},
    )
    this.renderChild = getRenderChild(spreader)(paramCaseComponents)
  }

  render() {
    const { data } = this.props

    return <Fragment>{data.map(this.renderChild)}</Fragment>
  }
}
