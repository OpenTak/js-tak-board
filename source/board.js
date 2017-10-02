const times = (n, fn) => { while (n--) { fn(n) }; };
const last  = (ary) => ary[ary.length - 1];

import Marray from './marray';

export default class Board {
  constructor(size = 5) {
    this.size    = size;
    this.state   = Marray.two(size, size, () => []);
    this.history = [];
  }

  // TODO
  fromHistory(history) {

  }

  move(ptn, color = 'w') {
    // Check if the PTN is valid in the context of a board
    if (!this.isValid(ptn, color)) {
      return [false, this.errors];
    }

    let stack     = [];
    const moveSet = ptn.toMoveset();

    moveSet.forEach(({ action, x, y, count = 1, flatten, type }) => {
      const target = this.state[y][x];


      // If it's a placement, break out.
      if (type) return target.push(this.piece(type, color));

      if (action === 'pop') {
        times(count, () => stack.push(target.pop()));
      } else {
        // Strip off the wall: Sb -> b
        if (flatten) {
          target[target.length - 1] = target[target.length - 1][1];
        }

        times(count, () => target.push(stack.pop()));
      }
    });

    this.history.push([ptn.ptn, moveSet]);
  }

  // TODO
  undo(ptn) {
    // let   stack   = [];
    // const moveSet = ptn.toUndoMoveSet();

    // moveSet.forEach(({ action, x, y, count = 1, flatten, type }) => {
    //   const target = this.state[y][x];
    // });
  }

  isValid(ptn, color) {
    const {x, y} = ptn;

    this.errors = [];

    // If it's outside of the board area you can't do much to it.
    if (x >= this.size || y >= this.size) {
      this.errors.push('Cannot find stack.');
      return false;
    }

    // Not yo stack
    if (!this.playerOwns(ptn, color)) {
      this.errors.push('Cannot move stack player does not own.');
      return false;
    }

    const rowTrajectory    = ptn.rowTrajectory();
    const columnTrajectory = ptn.columnTrajectory();

    // Out of bounds - Thinking the 0 case should be with PTN....
    if (rowTrajectory >= this.size || rowTrajectory < 0) {
      this.errors.push('Move is out of bounds.');
      return false;
    }

    if (columnTrajectory >= this.size || columnTrajectory < 0) {
      this.errors.push('Move is out of bounds.');
      return false;
    }

    const moveSet = ptn.toMoveset();

    moveSet.find(({ action, x: x1, y: y1, count = 1, flatten, type }, i) => {
      // Skip the first move pop
      if (i === 0 && action === 'pop') return false;

      const targetTop = this.top(x1, y1);

      if (ptn.isPlacement()) {
        if (targetTop.length) {
          this.errors.push('Cannot place on non-empty square.');
        }

        return true;
      }

      // Can't do anything to capstones
      if (targetTop[0] === 'C') {
        this.errors.push('Cannot move on top of Capstone.');
        return true;
      }

      // Walls should be left alone unless a capstone hits it as the last moved piece
      if (targetTop[0] === 'S') {
        if (this.top(x, y)[0] !== 'C') {
          this.errors.push('Cannot flatten wall without capstone.');
          return true;
        }

        if (i !== moveSet.length - 1) {
          this.errors.push('Cannot flatten wall unless capstone is the last distributed piece.');
          return true;
        }
      }
    });

    return !this.errors.length;
  }

  playerOwns(ptn, color) {
    return last(this.top(ptn.x, ptn.y)) === color;
  }

  target(x, y) {
    return this.state[y][x];
  }

  top(x,y) {
    return last(this.target(x, y));
  }

  piece(type, color) {
    switch (type) {
      case 'capstone': return 'C' + color;
      case 'wall':     return 'S' + color;
      default:         return color;
    }
  }
};
