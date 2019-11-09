# jcod-react-parser

React Component for parsing JSON/JCOD object recursively and produce an React Components tree.

## Getting Started

### Prerequisites

JCOD (JSON as Component Object Description) is an object syntax. It is a JSON subtree for the description of components. See more details on [JCOD.org](https://www.jcod.org/)  
(Also, for more information you will soon be able to read an article about it on Medium.)

Below, you can view [a sample of JCOD](#sample-of-jcod) structure.

```javascript
const sampleOf_JCOD = [
    {
        key: 'sample-1',
        component: 'div',
        children: 'My test',
    },
    {
        key: 'sample-2',
        component: 'smart-section',
        children: [
            'A simple smart section',
            {
                key: 'sample-1',
                component: 'div',
                children: 'Foo inside !',
                props: {
                    class: 'sample-class',
                    id: 'sample-id',
                },
            },
            {
                key: 'sample-2',
                component: 'SampleBloc',
                children: 'A sample bloc',
            },
        ],
        props: {
            element: 'i',
        },
    },
]
```

### How to use

import the JcodParser and use like any other React component:

```javascript
import JcodParser from 'jcod-react-parser'

// [...]

const myFunctionalComponent = () => (
    <JcodParser
        components={availableComponent}
        data={jcodTree}
        options={parserOptions}
        spreader={spreaderObject}
    />
)
```

### About The React Extended JCOD

The jcod-react-parser use an extended version of JCOD node, with some specifical keys:

-   **key**: (`String`) The value of [key attribute](https://reactjs.org/docs/lists-and-keys.html#keys). If some nodes do not have `key`, the parser will try to set with a unique automatic value for each of these node.
-   **renderProps**: (`Object` of Key/value) Like the `children` key. Each value of this object will be parse.

**Also,**

-   If a key name `key` is specified in the `props` or `renderProps` object, it will be ignored by the parser.
-   If a key name `children` is specified in the `props` object, it will be use as children of react component **BUT will not be parse**.
-   If a `children` key name is specified in the `renderProps` object, it will be use as children of react component **AND will be parse**. It is an alias to the ROOT `children` key name.
-   If multiple `children` key name are specified, (in the root, `props` and/or `renderProps`) only one will be used. It will be selected in this order of priority: ROOT, `renderProps` and `props`.

**React JCOD definition**

```javascript
{
    component: /REQUIRED/
        STRING // "TagName of react component",
    key: /OPTIONAL/ (react-parser-key)
        STRING // "'String' to use as react-key",
    children: /OPTIONAL/
        STRING // "'String' as children prop value",
        (or) JCOD-OBJECT // "{Component} as children prop value",
        (or) ARRAY-OF-STRING-OR-JCOD-OBJECT // "'String' and/or {Components} as children prop value",
    props: /OPTIONAL/
        JCOD-PROPS-OBJECT // "List of Key-value who defined the props of component"
    renderProps: /OPTIONAL/ (react-parser-key)
        OBJECT-OF-JCOD-TREE // "List of Key-value who defined the render-props of component."
},
```

**Sample of Extended JCOD**

```json
{
    "key": "sample-of-key",
    "component": "Switch",
    "children": "Enable Option ?",
    "props": {
        "className": "sample-class",
        "id": "sample-id",
        "name": "option",
    },
    "renderProps": {
        "onLabel": "Yes !",
        "offLabel": {
            "component": "BoldItem",
            "children": "Off",
            "props": {
                "className": "warning-red",
            },
        },
    },
},
```

### Simple Sample

Here a sample of very lite React application:

```javascript
import React from 'react'
import ReactDOM from 'react-dom'
import JcodParser from 'jcod-react-parser'

import { MyComponent, MyOtherComponent } from './myTemplatesComponentsFolder'
const availableComponent = { MyComponent, MyOtherComponent }

const jcodData = [
    'Sample Of App',
    {
        key: 'comp-1',
        component: 'MyComponent',
        children: 'A simple test',
    },
    {
        key: 'comp-2',
        component: 'MyOtherComponent',
        children: 'A simple other test',
    },
]

ReactDOM.render(
    <JcodParser components={availableComponent} data={jcodData} />,
    document.getElementById('App'),
)
```

You can see an [integration sample on Code Sandbox](https://codesandbox.io/s/jcod-sample-with-react-kqj75?fontsize=14)

### Props description

#### The JcodReactParser require these props:

-   `components`: an object containing a list of available React Component. The components of this list could be use in the JCOD object.

    Here a sample of available components:

    ```javascript
    import AnyComponent from 'anyFolder'
    import {
        LittleComponent,
        OtherComponent,
    } from './myTemplatesComponentsFolder'
    // Or so simply - In this sample `myComponents` could be use directly as value of `components` props:
    import * as myComponents from './anyOtherFolder'

    const availableComponents = {
        AnyComponent,
        LittleComponent,
        OtherComponent,
        ...myComponents,
    }
    ```

    or a very simple import:

    ```javascript
    import * as availableComponents from './anyOtherFolder'

    [...]

    ReactDOM.render(
        <JcodParser
            components={availableComponents}
            data={jcodData}
        />,
        document.getElementById('App')
    )

    ```

-   `data`: Any [JCOD object](#prerequisites)

#### The JcodReactParser can also receive these optional props:

-   `options`: An object of options.

    **Before, it should be noted that,**  
    To identify the type of component who has been set as the `component` key, the parser inspect the case and the syntax of the component name :

    -   React Component: First letter of the component name is Uparcase.
    -   Custome Element: Name in lowercase and 2 or more words, each seprate by an hyphen. (See [valid custom element name documentation](http://w3c.github.io/webcomponents/spec/custom/#valid-custom-element-name))
    -   HTML element: Name in lowercase and in only one word.

    ```javascript
    {
        "allowUnsecureElements": [boolean || Array (default to false)],
        "allowUnsecureHtmlElement": [boolean (default to false)],
        "allowUnsecureCustomElement": [boolean (default to false)],
        "displayErrorMessage": [boolean (default to true)],
        "__DEPRECATED__renderAllChildren": [boolean (default to false)],
    }
    ```


    -   If `allowUnsecureCustomElement` is `true`, you can use any [Custom Element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) tag as component in you JCOD object. The names of the custom elements must respect the [naming convention](http://w3c.github.io/webcomponents/spec/custom/#valid-custom-element-name). (If `allowUnsecureElements` is `true`, this value is override and is also `true`)
    -   If `allowUnsecureHtmlElement` is `true`, you can use any valid HTML tag as component in you JCOD object. (If `allowUnsecureElements` is `true`, this value is override and is also `true`)
    -   If `allowUnsecureElements`:

        -   is `true`, so `allowUnsecureCustomElement` and `allowUnsecureHtmlElement` are also `true`.
        -   is `Array` of `string`, each value of this array can be use as valid tag of `allowUnsecureCustomElement` or `allowUnsecureHtmlElement`.

            ```javascript
            import { MyComponent, MyOtherComponent } from './myTemplatesComponentsFolder'
            const availableComponent = { MyComponent, MyOtherComponent }

            const parserOption = {
                allowUnsecureElements: ['section', 'my-custom-element']
            }

            const jcodData = [
                {
                    {
                        key: 'comp-1',
                        component: 'myComponent',
                        props: {
                            children: 'Any test 1',
                        }
                    },
                    {
                        key: 'comp-2',
                        component: 'myOtherComponent',
                        props: {
                            children: 'Any test 2',
                        },
                    },
                    {
                        key: 'comp-3',
                        component: 'my-custom-element', // valid custom element tag
                        props: {
                            children: 'It is a custom element',
                        },
                    },
                    {
                        key: 'comp-4',
                        component: 'section', // valid element tag
                        props: {
                            children: 'It is an element',
                        },
                    },
                    {
                        key: 'comp-4',
                        component: 'div', // invalid element tag
                        props: {
                            children: 'It is a not display element',
                        },
                    },
                },
            ]

            const jcodContent = (
                <JcodParser
                    components={availableComponents}
                    data={jcodData}
                    options={parserOption}
                />
            )
            ```
    -   If `displayErrorMessage` is `false` the error or helping messages will be not display in the navigator DevTools console. Usually, this option should be disabled for the production build.
    -   the `__DEPRECATED__renderAllChildren` option offer the possibilities to support the legacy and depracated version of the JCOD specification. If it's `true`, the value of `children` key name in the `props` object will be parsed like the ROOT or `renderProps` value of `children` key name. This option is present to help you to migrate your codebase of JCOD to the official version of JCOD specification.

-   `spreader` : An object of utilities to convert or overload the JCOD tree or extend the possibilities of the Parser. The Spreader can be use for debug or any clever use you could imagine.

    ```json
    {
        "formater": [function (default to (child, metadata) => child)],
        "nodeDecorator": [function (default to (node, metadata) => node)],
        "treeDecorator": [function (default to (tree, metadata) => tree)],
    }
    ```

    **Sample of Spreader**

    ```jsx
    const sampleOfSpreader = {
        formater: (child, metadata) => child,
        nodeDecorator: (node, metadata) => (
            <div
                style={{ border: '1px solid red', margin: '2px' }}
                title={JSON.stringify(metadata)}
            >
                {node}
            </div>
        ),
        treeDecorator: (tree, metadata) => (
            <div
                style={{ border: '1px solid blue', margin: '2px' }}
                title={JSON.stringify(metadata)}
            >
                {node}
            </div>
        ),
    }
    ```

#### Sample of usage of all props:

```javascript
[...]

ReactDOM.render(
    <JcodParser
        components={templates}
        data={jcodData}
        options={parserOption}
        spreader={AnySpreaderComponent}
    />,
    document.getElementById('App')
)

```

## Versioning

This project use [SemVer](http://semver.org/) for versioning.

## Authors

-   **Nicolas KOKLA** - _Initial work_
    -   _Github_: [nkokla](https://github.com/nkokla)
    -   _Twitter_: [@nkokla](https://twitter.com/nkokla)

See also the list of [contributors](https://github.com/nkokla/jcod-react-parser/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
