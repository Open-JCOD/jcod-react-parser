import React from 'react'
import renderer from 'react-test-renderer'
import mockConsole from 'jest-mock-console'

import ContentParser, { stringerJoin } from './ContentParser'

const typeComponent = {
  html: {
    isHtmlElement: true,
    isCustomElement: false,
  },
  customElement: {
    isHtmlElement: false,
    isCustomElement: true,
  },
  reactElement: {
    isHtmlElement: false,
    isCustomElement: false,
  },
}

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

describe('[stringerJoin] Test Helper to join literally an array of string', () => {
  const strArr = ['first', 'second', 'third', 'fourth']
  test('Should join Four items', () => {
    expect(stringerJoin(strArr)).toBe('first, second, third and fourth')
  })
  test('Should join three items', () => {
    expect(stringerJoin(strArr.slice(0, 3))).toBe('first, second and third')
  })
  test('Should join two items', () => {
    expect(stringerJoin(strArr.slice(0, 1))).toBe('first')
  })
  test('Should return one items', () => {
    expect(stringerJoin(strArr.slice(0, 1))).toBe('first')
  })
})

describe('[ContentParser.getTypeOfComponent] Identify type of Component.', () => {
  const tester = ContentParser.getTypeOfComponent
  test('Should identify HTML element.', () => {
    const testHtmlElement = tester('html')
    expect(testHtmlElement).toEqual(typeComponent.html)
  })
  test('Should identify Custom-Element', () => {
    const testCustomElement = tester('custom-element')
    expect(testCustomElement).toEqual(typeComponent.customElement)
  })
  test('Should identify React Component', () => {
    const testReactComponent = tester('ReactComponent')
    expect(testReactComponent).toEqual(typeComponent.reactElement)
  })
})

describe('[ContentParser.getFalsyComponent] Identify the not supported component.', () => {
  const restoreConsole = mockConsole()
  const element = 'react'

  const falsyComponent = ContentParser.getFalsyComponent(
    element,
    typeComponent.html,
    true,
  )
  const spyError = console.error.mock.calls

  test('Should return a function.', () => {
    expect(typeof falsyComponent).toBe('function')
  })

  test('This function should return null.', () => {
    const falsyComponentValue = falsyComponent()
    expect(falsyComponentValue).toBeNull()
  })

  test('Should display 1 error.', () => {
    mockConsole()
    // const spyError = console.error.mock.calls
    expect(spyError.length).toBe(1)
    // expect(spyError).toEqual([])
    // expect(console.error.mock.calls).toEqual([])
  })

  restoreConsole()
})

describe('[ContentParser.showError] Analyse JCOD node & send error.', () => {
  const metadata = { path: '0.0.1' }

  describe('Test children value', () => {
    test('Should display 1 error: Children in ROOT & Props.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        children: 'something',
        props: {
          children: 'other something',
          className: 'any-class',
        },
      }
      const response = `The children of component [${jcodNode.component} // in position ${metadata.path}] have several values defined in [ROOT] and [props]. The value of the children used is the one defined in [ROOT]. Other values are ignored.`

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([[response]])
    })

    test('Should display 1 error: Children in ROOT & RenderProps.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        children: 'something',
        props: {
          className: 'any-class',
        },
        renderProps: {
          children: 'other something',
        },
      }
      const response = `The children of component [${jcodNode.component} // in position ${metadata.path}] have several values defined in [ROOT] and [renderProps]. The value of the children used is the one defined in [ROOT]. Other values are ignored.`

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([[response]])
    })

    test('Should display 1 error: Children in ROOT & RenderProps & Props.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        children: 'something',
        props: {
          children: 'other something',
          className: 'any-class',
        },
        renderProps: {
          children: 'other something again',
        },
      }
      const response = `The children of component [${jcodNode.component} // in position ${metadata.path}] have several values defined in [ROOT], [renderProps] and [props]. The value of the children used is the one defined in [ROOT]. Other values are ignored.`

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([[response]])
    })

    test('Should display 1 error: Children in RenderProps & Props.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        props: {
          children: 'something',
          className: 'any-class',
        },
        renderProps: {
          children: 'other something',
        },
      }
      const response = `The children of component [${jcodNode.component} // in position ${metadata.path}] have several values defined in [renderProps] and [props]. The value of the children used is the one defined in [renderProps]. Other values are ignored.`

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([[response]])
    })

    test('Should NO display error: Children in RenderProps.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        props: {
          className: 'any-class',
        },
        renderProps: {
          children: 'something',
        },
      }

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([])
    })

    test('Should NO display error: Children in Props.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        props: {
          children: 'something',
          className: 'any-class',
        },
      }

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([])
    })

    test('Should NO display error: Children in ROOT.', () => {
      mockConsole()

      const jcodNode = {
        key: 'any key',
        component: 'React',
        children: 'something',
        props: {
          className: 'any-class',
        },
      }

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([])
    })
  })

  describe('Test key value', () => {
    test('Should display 1 error: key in Props.', () => {
      mockConsole()

      const jcodNode = {
        component: 'React',
        children: 'something',
        props: {
          key: 'any key',
          className: 'any-class',
        },
      }
      const response = `The [props.key] with the value 'any key' of component [React // in position 0.0.1] is ignored. The key value, when defined, must be set in the ROOT of JCOD node.`

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([[response]])
    })

    test('Should display 1 error: key in Props.', () => {
      mockConsole()

      const jcodNode = {
        component: 'React',
        children: 'something',
        props: {
          className: 'any-class',
        },
        renderProps: { key: 'any key' },
      }
      const response = `The [renderProps.key] with the value 'any key' of component [React // in position 0.0.1] is ignored. The key value, when defined, must be set in the ROOT of JCOD node.`

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(spyError).toEqual([[response]])
    })
  })

  describe('Test Multiple Error (Children & key)', () => {
    test('Should display 3 errors. (children, props.key, renderProps.key)', () => {
      const restoreConsole = mockConsole()

      const jcodNode = {
        component: 'React',
        children: 'something',
        props: {
          key: 'any key',
          children: 'other something',
          className: 'any-class',
        },
        renderProps: {
          key: 'any other key',
          children: 'other something again',
        },
      }

      ContentParser.showError(jcodNode, metadata)
      const spyError = console.error.mock.calls

      expect(Array.isArray(spyError)).toBe(true)
      expect(Array.isArray(spyError[0])).toBe(true)
      expect(spyError[0].length).toBe(3)

      restoreConsole()
    })
  })
})

// getComponent
describe('[ContentParser.getComponent] Identify good & falsy component.', () => {
  const availableComponent = {}
  // TODO : test On Error message
  // TODO : test for HTML & Custom-Element
  // TODO : test for Limited list of elment

  test('Should return a FalsyComponent (html element)', () => {
    const options = {}

    const ReturnedComponent = ContentParser.getComponent(
      'html',
      availableComponent,
      options,
    )

    expect(typeof ReturnedComponent).toBe('function')
    expect(ReturnedComponent.name).toBe('FalsyComponent')
  })

  test('Should return a HTML Element', () => {
    const options = { allowUnsecureHtmlElement: true }
    const element = 'html'

    const ReturnedComponent = ContentParser.getComponent(
      element,
      availableComponent,
      options,
    )

    expect(typeof ReturnedComponent).toBe('string')
    expect(ReturnedComponent).toBe(element)
  })

  test('Should return a FalsyComponent (custom-element)', () => {
    const options = {}

    const ReturnedComponent = ContentParser.getComponent(
      'custom-element',
      availableComponent,
      options,
    )

    expect(typeof ReturnedComponent).toBe('function')
    expect(ReturnedComponent.name).toBe('FalsyComponent')
  })

  test('Should return a custom-element', () => {
    const options = { allowUnsecureCustomElement: true }
    const element = 'custom-element'

    const ReturnedComponent = ContentParser.getComponent(
      element,
      availableComponent,
      options,
    )

    expect(typeof ReturnedComponent).toBe('string')
    expect(ReturnedComponent).toBe(element)
  })

  test('Should return a FalsyComponent (ReactComponent)', () => {
    const options = {}

    const ReturnedComponent = ContentParser.getComponent(
      'UnknowComponent',
      availableComponent,
      options,
    )

    expect(typeof ReturnedComponent).toBe('function')
    expect(ReturnedComponent.name).toBe('FalsyComponent')
  })

  test('Should return a ReactComponent', () => {
    const options = {}
    const ReactComponent = () => null
    const availableComponent = { ReactComponent }

    const ReturnedComponent = ContentParser.getComponent(
      ReactComponent.name,
      availableComponent,
      options,
    )

    expect(typeof ReturnedComponent).toBe('function')
    expect(ReturnedComponent.name).toBe(ReactComponent.name)
  })
})

describe('[ContentParser] Ennable the parser & render of JCOD tree.', () => {
  const JcodParser = ContentParser
  const jcodHtml = { component: 'div' }
  const jcodHtmlExtend = {
    component: 'div',
    children: 'Test Children',
    props: { anyProps: 'something as props value', className: 'class' },
  }
  const jcodCutomElement = { component: 'custom-element' }
  const jcodCutomElementExtend = {
    component: 'custom-element',
    children: 'Test Children',
    props: { anyProps: 'something as props value', className: 'class' },
  }
  const jcodReactComponent = { component: 'ReactComponent' }
  const jcodReactComponentExtend = {
    component: 'ReactComponent',
    children: 'Test Children',
    props: { anyProps: 'something as props value', className: 'class' },
  }
  const jcodTree = [
    'string node',
    jcodHtml,
    jcodHtmlExtend,
    jcodCutomElement,
    jcodCutomElementExtend,
    jcodReactComponent,
    jcodReactComponentExtend,
  ]

  const ReactComponent = ({children, ...props}) => <div {...props}>{children}</div>
  const availableComponent = {
    ReactComponent 
  }

  test('Should render only String node of a JCOD tree without crash', () => {
    const testRenderer = renderer.create(
      <JcodParser
        components={{}}
        data={jcodTree}
        options={{}}
      />,
    )
    console.log(testRenderer.toJSON())
    let tree = testRenderer.toJSON()
    expect(tree).toMatchSnapshot()
    expect(tree).toEqual('string node')
  })

  test('Should render only ReactComponent of a JCOD tree without crash', () => {
    const testRenderer = renderer.create(
      <JcodParser
        components={availableComponent}
        data={jcodTree}
        options={{}}
      />,
    )
    console.log(testRenderer.toJSON())
    let tree = testRenderer.toJSON()
    expect(tree).toMatchSnapshot()
    // expect(tree).toEqual('')
  })

  test('Should render ReactComponent and HTML element a simple JCOD tree without crash', () => {
    const testRenderer = renderer.create(
      <JcodParser
        components={availableComponent}
        data={jcodTree}
        options={{ allowUnsecureHtmlElement: true }}
      />,
    )
    console.log(testRenderer.toJSON())
    let tree = testRenderer.toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Should render ReactComponent and custom-element a simple JCOD tree without crash', () => {
    const testRenderer = renderer.create(
      <JcodParser
        components={availableComponent}
        data={jcodTree}
        options={{ allowUnsecureCustomElement: true }}
      />,
    )
    console.log(testRenderer.toJSON())
    let tree = testRenderer.toJSON()
    expect(tree).toMatchSnapshot()
  })

  test('Should render ReactComponent, HTML element and custom-element a simple JCOD tree without crash', () => {
    const testRenderer = renderer.create(
      <JcodParser
        components={availableComponent}
        data={jcodTree}
        options={{ allowUnsecureElements: true }}
      />,
    )
    console.log(testRenderer.toJSON())
    let tree = testRenderer.toJSON()
    expect(tree).toMatchSnapshot()
  })

  // constructor - After mount : Enable renderChild as methode of instance

  // render - Return the React Tree
})
