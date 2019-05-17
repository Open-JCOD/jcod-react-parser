import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'
import paramCase from 'param-case'

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
      useValidCustomElementName: PropTypes.bool,
      htmlElement: PropTypes.bool,
      customElement: PropTypes.bool,
    }),
    spreader: PropTypes.func,
  }

  static defaultProps = {
    data: [],
    components: {},
    options: {
      useValidCustomElementName: false, // http://w3c.github.io/webcomponents/spec/custom/#valid-custom-element-name
      htmlElement: false,
      customElement: false,
    },
  }

  constructor(props) {
    super(props)

    const { components, options: instanceOptions, spreader } = props
    const options = {
      ...ContentParser.defaultProps.options,
      ...instanceOptions,
    }

    const getRenderChild = (
      spreader = (instance, component, data, key) => instance,
    ) => (availableComp = {}) =>
      function renderChild(child) {
        if (typeof child === 'string') {
          const component = '[object Text]'
          const key = child
          const data = { component, value: child }
          return spreader(child, component, data, key)
        }
        if (typeof child === 'object') {
          const { component, key, props: childProps } = child
          const isHtmlElementCompatible =
            component.search(/(?:[A-Z]+)|(?:-+)/) < 0
          const isCustomElementCompatible = component.search(/-+/) >= 0
          const Component =
            availableComp[component] ||
            (options.customElement && isCustomElementCompatible && component) ||
            (options.htmlElement && isHtmlElementCompatible && component)

          if (!Component) {
            const errorMessage = [].concat(
              `[${component}] can not be rendered: \n  it is not an available component.`,
              isHtmlElementCompatible
                ? `\n> [${component}] seems to be a [HTML Element <${component}>]. \n  Maybe should you set the 'htmlElement' option to true ?`
                : [],
              isCustomElementCompatible
                ? `\n> [${component}] seems to be a [Custom Element <${component}>]. \n  Maybe should you set the 'customElement' option to true ?`
                : [],
            )
            console.error(...errorMessage)
          }

          const { children, ...otherProps } = childProps

          let childsComponent = null

          if (typeof children === 'object') {
            childsComponent = [].concat(children).map(renderChild)
          }

          return Component
            ? spreader(
                <Component key={key} {...otherProps}>
                  {childsComponent || renderChild(children)}
                </Component>,
                Component,
                child,
                key,
              )
            : null
        }

        return child
      }

    const translatedComponents = Object.entries(components).reduce(
      (acc, [componentInitName, component]) => {
        const { useValidCustomElementName } = options
        const componentKeyName = useValidCustomElementName
          ? paramCase(componentInitName)
          : componentInitName
        const componentName = `${componentKeyName}`
        return {
          ...acc,
          [componentName]: component,
        }
      },
      {},
    )
    this.renderChild = getRenderChild(spreader)(translatedComponents)
  }

  render() {
    const { data } = this.props

    return <Fragment>{data.map(this.renderChild)}</Fragment>
  }
}
