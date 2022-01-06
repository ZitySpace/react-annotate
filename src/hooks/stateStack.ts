// eslint-disable-next-line no-unused-vars
import { Label } from '../interface/basic'
import { groupBy } from '../utils/categorys&colors'

export interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

export interface State extends Array<Label> {}

export class StateStack {
  private stateStack: State[] = []
  private index: number = 0
  can: Can

  constructor(initialState?: State) {
    if (initialState) {
      this.stateStack.push(initialState)
      this.index = 1
    }
    this.updateCan()
  }

  reset() {
    this.stateStack = []
    this.index = 0
    this.updateCan()
    return this
  }

  nowState() {
    this.updateCan()
    return this.stateStack[this.index - 1]
  }

  nextState() {
    this.index += this.can.redo ? 1 : 0
    return this.nowState()
  }

  prevState() {
    this.index -= this.can.undo ? 1 : 0
    return this.nowState()
  }

  resetState() {
    if (this.can.reset)
      this.index = this.index !== 1 ? 1 : this.stateStack.length
    return this.nowState()
  }

  pushState(newState: State) {
    this.stateStack = this.stateStack.slice(0, this.index)
    this.index = this.stateStack.push(newState)
    return this.nowState()
  }

  updateCan() {
    this.can = {
      redo: this.index < this.stateStack.length,
      undo: this.index > 1,
      reset: this.stateStack.length > 1,
      save: this.index > 1 || this.index < this.stateStack.length
    }
  }

  groupedState() {
    if (this.nowState()) return groupBy(this.nowState(), 'categoryName')
    else return {}
  }
}
