# ErrorPanel Component

## Overview

The ErrorPanel component is a UI component that displays error information in a user-friendly panel. It supports different error types with appropriate styling and icons, and can display error messages, line numbers, and stack traces.

## Features

- ✅ Display error type with color-coded badges
- ✅ Show error message with clear formatting
- ✅ Display line number when available
- ✅ Show stack trace for debugging
- ✅ Close button to dismiss errors
- ✅ Responsive design for mobile and desktop
- ✅ Smooth slide-in animation
- ✅ Fixed positioning at bottom-right corner

## Requirements

This component satisfies the following requirements:
- **Requirement 4.1**: Display runtime errors in a visible error panel
- **Requirement 4.2**: Include error type, message, line number, and stack trace

## Usage

### Basic Usage

```vue
<template>
  <div>
    <error-panel :error="currentError" @close="handleClose" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ErrorPanel from './components/ErrorPanel.vue'

const currentError = ref(null)

function handleClose() {
  currentError.value = null
}

// Show an error
currentError.value = {
  type: 'syntax',
  message: 'Unexpected token',
  line: 10
}
</script>
```

### With useErrorHandler Composable

```vue
<template>
  <div>
    <error-panel 
      :error="errorHandler.latestError.value" 
      @close="errorHandler.clearErrors" 
    />
  </div>
</template>

<script setup>
import ErrorPanel from './components/ErrorPanel.vue'
import { useErrorHandler } from './composables/useErrorHandler'

const errorHandler = useErrorHandler()

// Add an error
errorHandler.addError({
  type: 'runtime',
  message: 'Cannot read property of undefined',
  line: 25,
  stack: 'Error: Cannot read property of undefined\n    at line 25'
})
</script>
```

## Props

### error

- **Type**: `Object | null`
- **Required**: No
- **Default**: `null`

The error object to display. When `null`, the panel is hidden.

#### Error Object Structure

```typescript
interface ErrorInfo {
  type: 'syntax' | 'runtime' | 'cesium' | 'parse'
  message: string
  line?: number        // Optional: line number where error occurred
  stack?: string       // Optional: stack trace for debugging
}
```

## Events

### close

Emitted when the user clicks the close button.

```vue
<error-panel :error="error" @close="handleClose" />
```

## Error Types

The component supports four error types, each with distinct styling:

### 1. Syntax Error (`type: 'syntax'`)
- **Color**: Orange (#faad14)
- **Icon**: Warning
- **Label**: 语法错误
- **Use Case**: JavaScript syntax errors

### 2. Runtime Error (`type: 'runtime'`)
- **Color**: Red (#f5222d)
- **Icon**: Circle Close
- **Label**: 运行时错误
- **Use Case**: Runtime exceptions and errors

### 3. Cesium Error (`type: 'cesium'`)
- **Color**: Orange (#fa8c16)
- **Icon**: Warning Triangle
- **Label**: Cesium 错误
- **Use Case**: Cesium API-specific errors

### 4. Parse Error (`type: 'parse'`)
- **Color**: Blue (#1890ff)
- **Icon**: Info
- **Label**: 解析错误
- **Use Case**: Vue SFC parsing errors

## Examples

### Syntax Error with Line Number

```javascript
{
  type: 'syntax',
  message: 'Unexpected token "}" at the end of function',
  line: 15
}
```

### Runtime Error with Stack Trace

```javascript
{
  type: 'runtime',
  message: 'TypeError: Cannot read property "entities" of undefined',
  line: 42,
  stack: `TypeError: Cannot read property "entities" of undefined
    at setupCesium (example.vue:42:15)
    at onMounted (example.vue:50:5)
    at callWithErrorHandling (runtime-core.esm-bundler.js:155:22)`
}
```

### Cesium Error

```javascript
{
  type: 'cesium',
  message: 'Failed to load terrain data from server',
  line: 28
}
```

### Parse Error (No Line Number)

```javascript
{
  type: 'parse',
  message: 'Invalid Vue SFC structure: missing closing template tag'
}
```

## Demo

To see the component in action, visit the demo page:

```
http://localhost:5174/demo/error-panel
```

Or run the development server:

```bash
npm run dev
```

Then navigate to `/demo/error-panel` in your browser.

## Testing

The component has comprehensive unit tests covering:
- Rendering with different error types
- Displaying error message, line number, and stack trace
- Close button functionality
- Conditional rendering of optional fields
- CSS class application for different error types

Run tests:

```bash
npm test src/components/ErrorPanel.test.js
```

## Styling

The component uses scoped styles with the following key features:

- **Fixed positioning**: Bottom-right corner (20px from edges)
- **Responsive**: Adjusts to full width on mobile devices
- **Animation**: Smooth slide-in effect on mount
- **Max dimensions**: 500px width, 400px height
- **Scrollable content**: Error content scrolls if too long
- **Dark stack trace**: Stack traces use dark theme for better readability

## Dependencies

- Vue 3 (Composition API)
- Element Plus (for icons and button)
- @element-plus/icons-vue (for error type icons)

## Browser Support

The component supports all modern browsers that support:
- CSS Grid
- CSS Flexbox
- CSS Animations
- ES6+ JavaScript

## Accessibility

- Semantic HTML structure
- Clear visual hierarchy
- Color-coded error types
- Readable font sizes and line heights
- Keyboard-accessible close button

## Future Enhancements

Potential improvements for future versions:

- [ ] Multiple error display (error queue)
- [ ] Auto-dismiss after timeout
- [ ] Copy error to clipboard button
- [ ] Expand/collapse stack trace
- [ ] Error severity levels
- [ ] Custom positioning options
- [ ] Dark mode support
- [ ] Internationalization (i18n)
