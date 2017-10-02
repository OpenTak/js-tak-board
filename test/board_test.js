import { describe, it } from 'mocha';
import { expect } from 'chai';

import Ptn from 'ptn';

import Board from '../source/board';

describe('Board', () => {
  describe('#properties', () => {
    it('creates a board with history', () => {
      const board = new Board(3);

      expect(board.state).to.deep.equal([
        [[], [], []],
        [[], [], []],
        [[], [], []]
      ]);

      expect(board.history).to.deep.equal([]);
    });
  });

  // describe('move', () => {
  //   it('can make placement moves', () => {
  //     const board = new Board(3);

  //     board.move(Ptn.parse('a1'), 'b');

  //     expect(board.state).to.deep.equal([
  //       [['b'], [], []],
  //       [[   ], [], []],
  //       [[   ], [], []]
  //     ]);

  //     board.move(Ptn.parse('a2'));

  //     expect(board.state).to.deep.equal([
  //       [['b'], [], []],
  //       [['w'], [], []],
  //       [[   ], [], []]
  //     ]);

  //     expect(board.history.map(h => h[0])).to.deep.equal([
  //       'a1', 'a2'
  //     ]);
  //   });

  //   it('can make movements', () => {
  //     const board = new Board(3);

  //     board.state = [
  //       [['w', 'b', 'w'], [], []],
  //       [[             ], [], []],
  //       [[             ], [], []]
  //     ];

  //     board.move(Ptn.parse('2a1>11'));

  //     expect(board.state).to.deep.equal([
  //       [['w'], ['b'], ['w']],
  //       [[   ], [   ], [   ]],
  //       [[   ], [   ], [   ]]
  //     ]);

  //     expect(board.history[0][0]).to.equal('2a1>11');
  //   });

  //   it('can smash a wall', () => {
  //     const board = new Board(3);

  //     board.state = [
  //       [['w', 'b', 'Cw'], [], ['Sb']],
  //       [[              ], [], [    ]],
  //       [[              ], [], [    ]]
  //     ];

  //     board.move(Ptn.parse('2a1>11*'));

  //     expect(board.state).to.deep.equal([
  //       [['w'], ['b'], ['b', 'Cw']],
  //       [[   ], [   ], [         ]],
  //       [[   ], [   ], [         ]]
  //     ]);

  //     expect(board.history[0][0]).to.equal('2a1>11*');
  //   });
  // });

  describe('playerOwns', () => {
    it('can tell if a player owns a stack', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1');

      board.state = [
        [['w'], [], []],
        [[   ], [], []],
        [[   ], [], []]
      ];

      expect(board.playerOwns(ptn, 'w')).to.equal(true);
    });
  });

  describe('target', () => {
    it('gets a target point from the board state', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1');

      board.state = [
        [['w'], [], []],
        [[   ], [], []],
        [[   ], [], []]
      ];

      expect(board.target(ptn.x, ptn.y)).to.deep.equal(['w']);
    });
  });

  describe('top', () => {
    it('gets the top piece of a square in the board state', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1');

      board.state = [
        [['w'], [], []],
        [[   ], [], []],
        [[   ], [], []]
      ];

      expect(board.top(ptn.x, ptn.y)).to.deep.equal('w');
    });
  });

  describe('isValid', () => {
    it('cannot affect squares outside of the board area', () => {
      const board = new Board(3);
      const ptn = Ptn.parse('a5');

      expect(board.isValid(ptn, 'w')).to.equal(false);
      expect(board.errors).to.include('Cannot find stack.');
    });

    it('cannot affect a square not owned by the moving player', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1>');

      board.state = [
        [['w'], [], []],
        [[   ], [], []],
        [[   ], [], []]
      ];

      expect(board.isValid(ptn, 'b')).to.equal(false);
      expect(board.errors).to.include('Cannot move stack player does not own.');
    });

    it('cannot move outside the board area', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1<');

      board.state = [
        [['w'], [], []],
        [[   ], [], []],
        [[   ], [], []]
      ];

      expect(board.isValid(ptn, 'w')).to.equal(false);
      expect(board.errors).to.include('Move is out of bounds.');
    });

    it('cannot affect capstones', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1>');

      board.state = [
        [['w'], ['Cw'], []],
        [[   ], [    ], []],
        [[   ], [    ], []]
      ];

      expect(board.isValid(ptn, 'w')).to.equal(false);
      expect(board.errors).to.include('Cannot move on top of Capstone.');
    });

    it('cannot affect walls without a capstone', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('a1>');

      board.state = [
        [['w'], ['Sw'], []],
        [[   ], [    ], []],
        [[   ], [    ], []]
      ];

      expect(board.isValid(ptn, 'w')).to.equal(false);
      expect(board.errors).to.include('Cannot flatten wall without capstone.');
    });

    it('cannot flatten walls unless the capstone is the last piece moved', () => {
      const board = new Board(3);
      const ptn   = Ptn.parse('2a1>11');

      board.state = [
        [['b', 'b', 'Cw'], ['Sb'], ['Sw']],
        [[              ], [    ], [    ]],
        [[              ], [    ], [    ]]
      ];

      expect(board.isValid(ptn, 'w')).to.equal(false);
      expect(board.errors).to.include('Cannot flatten wall unless capstone is the last distributed piece.');
    });
  });
});
