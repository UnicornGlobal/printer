import Printer from '@/Printer.vue'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import sinon from 'sinon'

const localVue = createLocalVue()

describe('Printer.vue', () => {
  it('Throws exception if Axios is not present', () => {
    let log = sinon.stub(console, 'log')
    let error = sinon.stub(console, 'error')

    try {
      let printer = shallowMount(Printer, {
        attachToDocument: true,
        localVue,
        propsData: {
          printUrl: 'https://example.com/example.jpg',
          fileName: 'filename'
        }
      })
    } catch (e) {
      expect(e.toString()).toBe('Error: Vue Axios is required on `this.$http`')
    }

    log.restore()
    error.restore()
  })

  it('Mounts correctly with axios methods present', () => {
    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().resolves({})
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename'
      }
    })

    expect(printer.vm.printing).toBe(false)
    expect(typeof printer.vm.print).toBe('function')
  })

  it('Prints a remote image', async () => {
    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().resolves({
            data: {},
            headers: {
              'content-type': 'image/png'
            }
          })
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename',
        timeout: 1
      }
    })

    window.URL.createObjectURL = sinon.stub().returns('xx')
    window.URL.revokeObjectURL = sinon.stub().returns(true)
    window.open = sinon.stub().returns({
      print: sinon.stub().returns(true)
    })

    const result = await printer.vm.print()

    expect(window.URL.createObjectURL.called).toBe(true)
    expect(window.open.called).toBe(true)
    expect(window.URL.revokeObjectURL.called).toBe(false)
  })

  it('Blocks double clicking', async () => {
    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().resolves({
            data: {},
            headers: {
              'content-type': 'image/png'
            }
          })
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename',
        timeout: 1
      }
    })

    window.URL.createObjectURL = sinon.stub().returns('xx')
    window.URL.revokeObjectURL = sinon.stub().returns(true)
    window.open = sinon.stub().returns({
      print: sinon.stub().returns(true)
    })

    expect(printer.vm.printing).toBe(false)
    printer.vm.print()
    expect(printer.vm.printing).toBe(true)

    await printer.vm.print()

    expect(window.URL.createObjectURL.called).toBe(true)
    expect(window.open.called).toBe(true)
    expect(window.URL.revokeObjectURL.called).toBe(false)

    setTimeout(() => {
      expect(printer.vm.printing).toBe(false)
      expect(window.URL.revokeObjectURL.called).toBe(true)
    }, 100)
  })

  it('Uses injected error handler if present', async () => {
    const errorHandler = sinon.stub().throws()

    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().rejects()
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename',
        errorHandler
      }
    })

    expect(errorHandler.called).toBe(false)

    try {
      const result = await printer.vm.print()
    } catch (e) {
      expect(errorHandler.called).toBe(true)
    }
  })

  it('Handles blocked popups', async () => {
    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().rejects({
            message: 'Cannot read property \'print\' of null'
          })
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename'
      }
    })

    try {
      const result = await printer.vm.print()
    } catch (e) {
      const message = e.message
      setTimeout(() => {
        expect(e.message).toBe('You need to enable popups in your browser in order to print. Please do so and try again.')
        expect(e.title).toBe('Popups Blocked!')
      }, 100)
    }
  })

  it('Handles blocked popups with a custom message', async () => {
    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().rejects({
            message: 'Cannot read property \'print\' of null'
          })
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename',
        blockedPopupMessage: 'xxx'
      }
    })

    try {
      const result = await printer.vm.print()
    } catch (e) {
      const message = e.message
      setTimeout(() => {
        expect(e.message).toBe('xxx')
        expect(e.title).toBe('Popups Blocked!')
      }, 100)
    }
  })

  it('Handles generic errors', async () => {
    let printer = shallowMount(Printer, {
      attachToDocument: true,
      localVue,
      mocks: {
        $http: {
          get: sinon.stub().rejects({})
        }
      },
      propsData: {
        printUrl: 'https://example.com/example.jpg',
        fileName: 'filename'
      }
    })

    try {
      const result = await printer.vm.print()
    } catch (e) {
      const message = e.message
      setTimeout(() => {
        expect(e.message).toBe('Error')
        expect(e.title).toBe('Error')
      }, 100)
    }
  })
})
