---
category: Components
type: General
title: ColorPickerCircleButton
cover: ''
---

## Introduction

Color picker, triggering color selection by a circular button

## API

The properties of the Color Picker-Round Button are described as follows:

| Property | Description                                                | Type                                      | Default Value |
| -------- | ---------------------------------------------------------- | ----------------------------------------- | ------------- |
| color    | Initialize color                                           | `string`                                  | -             |
| style    | custom css style object                                    | `JSX.CSSProperties`                       | -             |
| onColor  | Callback function after user selects color                 | `(color: string, val?: boolean) => void;` | -             |
| onCancel | The callback function after the user cancels the selection | `() => void`                              | -             |

## Case

```jsx
import { ColorPickerCircleButton } from '@univer/style-universheet';
import { Component } from '@univer/base-component';

type IPanelProps = {};

interface IState {}

class AlternatingColorsSide extends Component<IPanelProps, IState> {
    /**
     * choose custom color
     */
    handleColorSelect(color: string) {}
    /**
     * cancel choose custom color
     */
    handleColorCancel() {}

    /**
     * Render the component's HTML
     *
     * @returns {void}
     */
    render(props: IPanelProps, state: IState) {
        return (
            <ColorPickerCircleButton
                color={'#ffffff'}
                style={{ bottom: '30px', right: '0' }}
                onColor={this.handleColorSelect.bind(this)}
                onCancel={this.handleColorCancel.bind(this)}
            />
        );
    }
}
```
