# vue-printer

#### Easy printing of remote images for Vue

Loads a remote image URL and prompts to print it using the
browsers native print functionality.

## Install

```
npm install vue-printer --save
```

## Test and Build

```
npm run test
npm run build
```

## Usage

```
import Printer from 'vue-printer'
```

Include it in the component you'd like to use it in.

### Basic

This will result in a 'Print' button that will trigger the
printing of the remote image URL.

```vue
<printer
  printUrl="https://example.com/example.jpg"
  fileName="Example">
</printer>
```

### Advanced

This will add a custom error handler and a custom 'blocked popups'
messsage, set a custom timeout and will apply a class to the button

```vue
<printer
  class="my-print-button"
  printUrl="https://example.com/example.png"
  fileName="Example"
  blockedPopupMessage="Enable popups to print!"
  timeout="120000"
  :errorHandler="errorHandler">
</printer>
```

#### Blocked Popups

This component opens a blob that it retrieves and processes and
this mechanism triggers the browsers popup warning.

If the user blocks popups we need to notify them of this fact and
tell them they must enable popups for the domain.

You can adjust this message with the `blockedPopupMessage` property.

#### Timeout

Garbage collection usually cleans up the generated block almost
immediately, and doing this ensures that a user is able to
perform actions like 'save to file' from the browsers print dialog.

Default is 60 seconds.

You can customise this value with the `timeout` property.

#### Custom Error Handler

You can inject a custom error handler so that you can perform actions
like displaying a toast message or custom error logging functions.

An example using the `unicorn-vue-toaster` package to add a toast
message.

```js
// main.js
import Vue from 'vue'
import { ToasterEvents } from 'unicorn-vue-toaster'

Vue.prototype.$toaster = ToasterEvents
```

```vue
// ParentComponent.vue
<template>
  <div>
    <h2>Print Me</h2>
    <printer
      printUrl="https://example.com/example.png"
      fileName="Example"
      :errorHandler="errorHandler">
    </printer>
  </div>
</template>

<script>
  import Printer from 'vue-printer'

  export default {
    components: {
      Printer
    },
    methods: {
      errorHandler(error, message) {
        this.$toaster.addToast({
          type: 'error',
          message: message,
          title: error,
          timeout: 5000
        })
      }
    }
  }
</script>
```
