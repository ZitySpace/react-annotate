/* eslint-disable no-unused-vars */
import { RectLabel, PointLabel, LineLabel } from '../interface/annotations'

export interface Can {
  redo: boolean
  undo: boolean
  reset: boolean
  save: boolean
}

export class StateStack {
  private stateStack: (RectLabel | PointLabel | LineLabel)[][] = []
  private index: number = 0
  can: Can

  constructor(initialState?: (RectLabel | PointLabel | LineLabel)[]) {
    if (initialState) {
      this.stateStack.push(initialState)
      this.index = 1
    }
    this.updateCan()
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

  pushState(newState: (RectLabel | PointLabel | LineLabel)[]) {
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
}
