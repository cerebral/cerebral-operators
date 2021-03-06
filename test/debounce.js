/*global beforeEach,afterEach,describe,it*/
import debounce from '../src/debounce'
import { reset, check, expect, expectCount } from './helpers/chaiCounter'
import { Controller } from 'cerebral-testable'

function increaseCount ({ state }) {
  state.set('count', state.get('count') + 1)
}

beforeEach(reset)
afterEach(check)

describe('debounce()', function () {
  let controller, signals

  beforeEach(function () {
    [controller, signals] = Controller({
      count: 0
    })

    controller.addSignals({
      increaseImmediate: {
        chain: [
          [debounce(1, {
            immediate: true
          }), {
            accepted: [ increaseCount ],
            discarded: []
          }]
        ],
        immediate: true
      },
      increaseNotImmediate: {
        chain: [debounce(1, [ increaseCount ])],
        immediate: true
      }
    })
  })

  it('should not call increase more than twice when immediate', function (done) {
    signals.increaseImmediate()
    signals.increaseImmediate()
    signals.increaseImmediate()
    signals.increaseImmediate()
    signals.increaseImmediate()

    setTimeout(function () {
      expect(controller.get('count')).to.equal(2)
      done()
    }, 10)
  })

  it('should not call increase more than once when not immediate', function (done) {
    signals.increaseNotImmediate()
    signals.increaseNotImmediate()
    signals.increaseNotImmediate()
    signals.increaseNotImmediate()
    signals.increaseNotImmediate()

    setTimeout(function () {
      expect(controller.get('count')).to.equal(1)
      done()
    }, 10)
  })

  it('should not call output more than twice when immediate', function (done) {
    expectCount(1)
    let terminated = 0
    let continued = 0

    const chain = debounce(10, [], { immediate: true, throttle: false })

    const args = {
      output: {
        accepted () {
          continued++
          if (continued === 2) {
            expect(terminated).to.equal(3)
            done()
          }
        },
        discarded () {
          terminated++
        }
      }
    }

    chain[0](args)
    chain[0](args)
    chain[0](args)
    chain[0](args)
    chain[0](args)
  })

  it('should not call output again after timeout when immediate', function (done) {
    expectCount(1)
    let terminated = 0
    let continued = 0

    const chain = debounce(10, [], { immediate: true, throttle: true })

    const args = {
      output: {
        accepted () {
          continued++
          if (continued === 3) {
            expect(terminated).to.equal(3)
            done()
          }
        },
        discarded () {
          terminated++
        }
      }
    }

    chain[0](args)
    chain[0](args)
    chain[0](args)
    setTimeout(() => {
      chain[0](args)
      chain[0](args)
      chain[0](args)
    }, 15)
  })

  it('should not call output more than once', function (done) {
    expectCount(1)
    let terminated = 0

    const chain = debounce(10, [], { immediate: false, throttle: false })

    const args = {
      output: {
        accepted () {
          expect(terminated).to.equal(4)
          done()
        },
        discarded () {
          terminated++
        }
      }
    }

    chain[0](args)
    chain[0](args)
    chain[0](args)
    chain[0](args)
    chain[0](args)
  })

  it('should call output again after timeout', function (done) {
    expectCount(1)
    let terminated = 0
    let continued = 0

    const chain = debounce(10, [], { immediate: false, throttle: false })

    const args = {
      output: {
        accepted () {
          continued++
          if (continued === 2) {
            expect(terminated).to.equal(4)
            done()
          }
        },
        discarded () {
          terminated++
        }
      }
    }

    chain[0](args)
    chain[0](args)
    chain[0](args)
    setTimeout(() => {
      chain[0](args)
      chain[0](args)
      chain[0](args)
    }, 15)
  })
})
