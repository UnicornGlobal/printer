<template>
  <button v-if="printUrl" @click.prevent="print">
    <template v-if="printing">
      Printing
    </template>
    <template v-else>
      Print
    </template>
  </button>
</template>

<script>
  export default {
    name: 'vue-printer',
    props: {
      /**
       * The URL of the remote image
       *
       * Must be an image (jpg, png etc)
       */
      printUrl: {
        required: true
      },
      /**
       * This becomes the name of the blob URL
       */
      fileName: {
        required: true
      },
      /**
       * When you print an image the garbage collection normally
       * removes the blob near-instantly, which affects the ability
       * to download / print to a PDF, as the blob needs to still
       * be available.
       *
       * This value provides a timeout before the blob is cleaned
       * up.
       *
       * 60 second default has worked well thus far.
       */
      timeout: {
        required: false,
        default: 60000
      },
      /**
       * Customised 'popups blocked' error message.
       *
       * Gets passed to the error handler with a specially
       * formatted error that can be customised by the parent
       * application.
       */
      blockedPopupMessage: {
        required: false,
        default: 'You need to enable popups in your browser for this domain in order to print.'
      },
      /**
       * Default error handler
       *
       * You can pass in a custom error handler provided that it
       * is configured to receive and handle 2 values, the error
       * message and the error title.
       *
       * You could inject something like vue-toaster here.
       */
      errorHandler: {
        required: false,
        type: Function,
        default: (error, title) => {
          throw({
            error,
            title
          })
        }
      }
    },
    data() {
      return {
        printing: false
      }
    },
    /**
     * The only real dependency, we use axios to perform this call
     * right now.
     *
     * TODO remove axios and do a raw xhr call to remove this
     * unneeded dependency.
     *
     * TODO validation on the printUrl
     */
    created() {
      if (!this.$http) {
        throw 'Vue Axios is required on `this.$http`'
      }
    },
    methods: {
      print() {
        this.printing = true

        /**
         * Retrieve the remote URL
         */
        return this.$http.get(this.printUrl, {
          transformResponse: undefined,
          responseType: 'blob'
        })
        .then(
          (response) => {
            /**
             * TODO error checking and validation to ensure that
             * the response is an image
             */
            const blob = new Blob([response.data], {
              type: response.headers['content-type']
            })

            const url = URL.createObjectURL(blob)
            const extension = response.headers['content-type'].split('/').pop()
            const fileName = `${this.fileName}.${extension}`

            let file = window.open(url, fileName)
            file.print()

            /**
             * Delays the cleaning up of the generated blob by the
             * defined timeout. This is to allow a user a grace
             * period on the print dialog to perform actions like
             * saving the printout to a file instead of sending to
             * a printer.
             */
            setTimeout(() => {
              URL.revokeObjectURL(url)
            }, this.timeout)
          }
        )
        .catch(
          (error) => {
            let title = 'Error'
            let message = error.message

            /**
             * If popups are blocked in the browser we get the
             * following error message. We need to clean the
             * message up and use a custom 'blocked popup' message
             */
            if (error.message === 'Cannot read property \'print\' of null') {
              title = 'Popups Blocked!'
              message = this.blockedPopupMessage
            }

            /**
             * Pass the error onto the default or injected error
             * handler for processing
             */
            this.errorHandler(title, message)
          }
        )
        .finally(() => {
          this.printing = false
        })
      }
    }
  }
</script>
