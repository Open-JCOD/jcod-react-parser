# jcod-react-parser

React Component for parsing JSON/JCOD object recursively and produce an React Components tree.

## Getting Started

### Prerequisites

If you don't know what is an JCOD structure, you should read this [article : url-to-article.com](url-to-article.com)

Below, you can view [a sample of JCOD](#sample-of-jcod) structure.

```javascript
const sampleOf_JCOD = [
    {
        key: 'sample-1',
        component: 'div',
        props: {
            children: 'My test',
        },
    },
    {
        key: 'sample-2',
        component: 'smart-section',
        props: {
            element: 'i',
            children: [
                'A simple smart section',
                {
                    key: 'sample-1',
                    component: 'div',
                    props: {
                        children: 'Foo inside !',
                    },
                },
                {
                    key: 'sample-2',
                    component: 'sample-bloc',
                    props: {
                        children: 'A sample bloc',
                    },
                },
            ],
        },
    },
]
```

### How to use

import the JcodParser and use like any other React component :

```JSX
import JcodParser from 'jcod-react-parser'

// [...]

const myFunctionalComponent = () => (
    <JcodParser
        components={availableComponent}
        data={jcodData}
        options={parserOptions}
        spreader={AnySpreaderComponent}
    />
)
```

Here a sample of very lite React application :

```JSX

import React from 'react'
import ReactDOM from 'react-dom'
import JcodParser from 'jcod-react-parser'

import { MyComponent, MyOtherComponent } from './myTemplatesComponentsFolder'
const availableComponent = { MyComponent, MyOtherComponent }

const jcodData = {
    {
        key: 'comp-1',
        component: 'my-component',
        props: {
            children: 'Any test',
        },
        key: 'comp-2',
        component: 'my-other-component',
        props: {
            children: 'Any test',
        },
    },
}

ReactDOM.render(
    <JcodParser
        components={availableComponent}
        data={jcodData}
    />,
    document.getElementById('App')
)

```

### Props description

The JcodReactParser require these props :

-   `components` : an object containing a list of available React Component. The components of this list could be use in the JCOD object.

Here a sample of available components :

```JavaScript
import AnyComponent from 'anyFolder'
import { LittleComponent, OtherComponent } from './myTemplatesComponentsFolder'
// Or so simply - In this sample `myComponents` could be use directly as value of `components` props :
import * as myComponents from './anyOtherFolder'

const availableComponents = {
    AnyComponent,
    LittleComponent,
    OtherComponent,
    ...myComponents,
}
```

or a very simple import :

```JSX
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

-   `data` : [Any JCOD object](#prerequisites)

The JcodReactParser can also receive these optional props :

-   `options` : An object of options

```JavaScript
{
    "element": [boolean (default to false)],
    "customElement": [boolean (default to false)],
}
```

If `element` is true, you can use any valid HTML tag as component in you JCOD object.  
If `customElement` is true, you can use any [custom element](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements) tag as component in you JCOD object. (Disclaimer: With this option, you lose any warning about the usage of an unrecognized component).

-   `spreader` : A function who receive the instance, component, JCOD data and key of each component declared in the JCOD object and who return a component. The Spreader can be is use/thinked like an High Order Component (HOC) for extend or overload the components. The Spreader can be use for debug or any clever use you could imagine.

```JSX
const sampleOfSpreader = (instance, component, data, key) => (
  <MyHigOrderComponent data={data} component={component} key={key}>
    {instance}
  </MyHigOrderComponent>
)
```

Sample of usage of all props :

```JSX
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

We use [SemVer](http://semver.org/) for versioning.

## Authors

-   **Nicolas KOKLA** - _Initial work_
    -   _Github_ : [nkokla](https://github.com/nkokla)
    -   _Twitter_ : [@nkokla](https://twitter.com/nkokla)

See also the list of [contributors](https://github.com/nkokla/jcod-react-parser/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
