import React, { Fragment, PureComponent } from 'react'
import PropTypes from 'prop-types'

export const stringerJoin = arrOfString => {
  // return arrOfString.join(', ')
  return arrOfString.reduce((str, entry, index, arr) => {
    if (index === 0) return str + entry
    if (index === arr.length - 1) return `${str} and ${entry}`
    return `${str}, ${entry}`
  }, '')
}

const componentType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({
    key: PropTypes.string,
    component: PropTypes.string.isRequired,
    props: PropTypes.object,
    renderProps: PropTypes.object,
  }),
])

const defaultSpreader = {
  formater: (child, metadata) => child,
  nodeDecorator: (node, metadata) => node,
  treeDecorator: (tree, metadata) => tree,
  // subTreeDecorator: (tree, metadata) => tree,
}

export default class ContentParser extends PureComponent {
  static propTypes = {
    data: PropTypes.arrayOf(componentType).isRequired,
    components: PropTypes.object,
    options: PropTypes.shape({
      allowUnsecureElements: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.array,
      ]),
      allowUnsecureHtmlElement: PropTypes.bool,
      allowUnsecureCustomElement: PropTypes.bool,
      displayErrorMessage: PropTypes.bool,
      __DEPRECATED__renderAllChildren: PropTypes.bool,
    }),
    spreader: PropTypes.shape({
      formater: PropTypes.func,
      nodeDecorator: PropTypes.func,
      treeDecorator: PropTypes.func,
      // subTreeDecorator: PropTypes.func,
    }),
  }

  static defaultProps = {
    data: [],
    components: {},
    options: {
      allowUnsecureHtmlElement: false,
      allowUnsecureCustomElement: false, // http://w3c.github.io/webcomponents/spec/custom/#valid-custom-element-name
      allowUnsecureElements: false,
      displayErrorMessage: true,
      __DEPRECATED__renderAllChildren: false,
    },
    spreader: defaultSpreader,
  }

  static getTypeOfComponent = component => {
    return {
      isHtmlElement: component.search(/(?:[A-Z]+)|(?:-+)/) < 0,
      isCustomElement: component.search(/-+/) >= 0,
    }
  }

  static FalsyComponent = function FalsyComponent() {
    return null
  }
  static getFalsyComponent = (
    component,
    typeOfComponent,
    displayErrorMessage,
  ) => {
    const errorMessage = [].concat(
      `[${component}] can not be rendered: \n  it is not an available component.`,
      typeOfComponent.isHtmlElement
        ? `\n> [${component}] seems to be a [HTML Element <${component}>]. \n  Maybe should you set the 'allowUnsecureHtmlElement' option to true ?`
        : [],
      typeOfComponent.isCustomElement
        ? `\n> [${component}] seems to be a [Custom Element <${component}>]. \n  Maybe should you set the 'allowUnsecureCustomElement' option to true ?`
        : [],
    )
    displayErrorMessage && console.error && console.error(...errorMessage)
    return ContentParser.FalsyComponent
  }

  static showError = (jcodNode, metadata = {}) => {
    if (!jcodNode || typeof jcodNode !== 'object') return
    const { path: jcodPath } = metadata
    const {
      component,
      // key,
      children,
      props: { key: jcodPropsKey, children: jcodPropsChildren } = {},
      renderProps: {
        key: jcodRenderPropsKey,
        children: jcodRenderPropsChildren,
      } = {},
    } = jcodNode
    const childrenValues = [].concat(
      children ? '[ROOT]' : [],
      jcodRenderPropsChildren ? '[renderProps]' : [],
      jcodPropsChildren ? '[props]' : [],
    )
    const errorMessage = [].concat(
      childrenValues.length > 1
        ? `The children of component [${component} // in position ${jcodPath}] have several values defined in ${stringerJoin(
            childrenValues,
          )}. The value of the children used is the one defined in ${
            childrenValues[0]
          }. Other values are ignored.`
        : [],
      jcodPropsKey
        ? `The [props.key] with the value '${jcodPropsKey}' of component [${component} // in position ${jcodPath}] is ignored. The key value, when defined, must be set in the ROOT of JCOD node.`
        : [],
      jcodRenderPropsKey
        ? `The [renderProps.key] with the value '${jcodRenderPropsKey}' of component [${component} // in position ${jcodPath}] is ignored. The key value, when defined, must be set in the ROOT of JCOD node.`
        : [],
    )
    errorMessage.length && console.error && console.error(...errorMessage)
  }

  static getComponent = (component, availableComponent = {}, options = {}) => {
    const typeOfComponent = ContentParser.getTypeOfComponent(component)

    if (options.allowUnsecureElements === true) {
      options.allowUnsecureCustomElement = true
      options.allowUnsecureHtmlElement = true
    }
    if (!Array.isArray(options.allowUnsecureElements))
      options.allowUnsecureElements = []

    return (
      availableComponent[component] ||
      (options.allowUnsecureElements.includes(component) && component) ||
      (options.allowUnsecureCustomElement &&
        typeOfComponent.isCustomElement &&
        component) ||
      (options.allowUnsecureHtmlElement &&
        typeOfComponent.isHtmlElement &&
        component) ||
      ContentParser.getFalsyComponent(component, typeOfComponent)
    )
  }

  constructor(props) {
    super(props)

    const { components, options: instanceOptions, spreader } = props
    const options = {
      ...ContentParser.defaultProps.options,
      ...instanceOptions,
    }

    const getRenderChild = (_spreader = {}) => (availableComp = {}) =>
      function renderChild(_path) {
        return (child, index, data) => {
          const jcodPath = `${_path ? `${_path}.` : ''}${index}`
          const spreader = {
            ...defaultSpreader,
            ..._spreader,
          }
          const getTranslateToInstance = index => entry => {
            if (typeof entry === 'undefined') return null
            return typeof entry === 'object'
              ? [].concat(entry).map(renderChild(jcodPath))
              : renderChild(jcodPath)(entry, index)
          }

          if (typeof child === 'string') {
            // TODO : Update formater for support string
            // const metadata = {
            //   path: jcodPath,
            //   jcod: { component: '[Text Node]', value: child },
            // }
            // return spreader.formater
            //   ? spreader.formater(child, metadata)
            //   : child
            return child
          }
          if (typeof child === 'object') {
            const metadata = {
              path: jcodPath,
              jcod: child,
            }
            const formatedJCOD = spreader.formater
              ? spreader.formater(child, metadata)
              : child
            const {
              component,
              // TODO : Get better system for get Key
              key = JSON.stringify(child),
              children: jcodChildren,
              props: jcodProps = {},
              renderProps: jcodRenderProps = {},
            } = formatedJCOD

            if (options.displayErrorMessage)
              ContentParser.showError(formatedJCOD, metadata)

            const Component = ContentParser.getComponent(
              component,
              availableComp,
              options,
            )

            const {
              key: jcodPropsKey,
              children: childrenProps,
              ...otherProps
            } = jcodProps
            const {
              key: jcodRenderPropsKey,
              children: childrenRenderProps,
              ...otherRenderProps
            } = jcodRenderProps

            const translateToInstances = getTranslateToInstance(index)

            const renderPropsComponents = Object.entries(
              otherRenderProps,
            ).reduce(
              (acc, [key, value]) => ({
                ...acc,
                [key]: translateToInstances(value),
              }),
              {},
            )

            const childsComponent =
              jcodChildren ||
              childrenRenderProps ||
              options.__DEPRECATED__renderAllChildren
                ? translateToInstances(
                    jcodChildren ||
                      childrenRenderProps ||
                      (options.__DEPRECATED__renderAllChildren &&
                        childrenProps),
                  )
                : childrenProps && childrenProps.toString()

            const instance = (
              <Component key={key} {...renderPropsComponents} {...otherProps}>
                {childsComponent}
              </Component>
            )

            return spreader.nodeDecorator
              ? spreader.nodeDecorator(instance)
              : instance
          }

          return child
        }
      }

    // ---------------------
    // ---------------------
    // ---------------------

    // TODO : Add support if 'components' is type Map
    const translatedComponents = Object.fromEntries
      ? Object.fromEntries(Object.entries(components))
      : Object.entries(components).reduce((acc, [componentName, component]) => {
          return {
            ...acc,
            [componentName]: component,
          }
        }, {})

    this.renderChild = getRenderChild(spreader)(translatedComponents)
  }

  render() {
    const { data, spreader = {} } = this.props
    const arrayData = Array.isArray(data) ? data : [data]

    return spreader.treeDecorator ? (
      spreader.treeDecorator(
        <Fragment>{arrayData.map(this.renderChild())}</Fragment>,
      )
    ) : (
      <Fragment>{arrayData.map(this.renderChild())}</Fragment>
    )
  }
}
