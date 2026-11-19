import React from 'react';
import ReactDOM from 'react-dom';
import Dragula from 'dragula';
import Board from './Board';

// Dragula's real mouse handling is checked in the browser; here we capture the
// 'drop' listener Board registers and call it the way Dragula would.
jest.mock('dragula', () => {
  const drake = { on: jest.fn(), cancel: jest.fn(), destroy: jest.fn() };
  const factory = jest.fn(() => drake);
  factory.drake = drake;
  return factory;
});

const drake = Dragula.drake;
let root;

const lanes = () => Array.from(root.querySelectorAll('.Swimlane-column'));
const laneBody = index => lanes()[index].querySelector('.Swimlane-dragColumn');
const cardIds = index => Array.from(laneBody(index).querySelectorAll('.Card')).map(card => card.dataset.id);
const card = id => root.querySelector(`.Card[data-id="${id}"]`);
const drop = (el, target, sibling) => {
  const handler = drake.on.mock.calls.find(call => call[0] === 'drop')[1];
  handler(el, target, laneBody(0), sibling || null);
};

beforeEach(() => {
  jest.clearAllMocks();
  root = document.createElement('div');
  document.body.appendChild(root);
  ReactDOM.render(<Board />, root);
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(root);
  root.remove();
});

it('renders three swimlanes with the Swimlane-column class', () => {
  expect(lanes()).toHaveLength(3);
  expect(lanes().map(lane => lane.querySelector('.Swimlane-title').textContent))
    .toEqual(['Backlog', 'In Progress', 'Complete']);
});

it('shows every shipping request in the backlog, grey', () => {
  expect(cardIds(0)).toHaveLength(20);
  expect(cardIds(1)).toEqual([]);
  expect(cardIds(2)).toEqual([]);
  expect(root.querySelectorAll('.Card.Card-grey')).toHaveLength(20);
});

it('registers the three lane bodies with Dragula', () => {
  expect(Dragula).toHaveBeenCalledWith([laneBody(0), laneBody(1), laneBody(2)]);
});

it('moves a card to In Progress and turns it blue', () => {
  drop(card('5'), laneBody(1));
  expect(cardIds(1)).toEqual(['5']);
  expect(cardIds(0)).not.toContain('5');
  expect(card('5').className).toContain('Card-blue');
  expect(card('5').dataset.status).toBe('in-progress');
});

it('moves a card to Complete and turns it green', () => {
  drop(card('7'), laneBody(2));
  expect(cardIds(2)).toEqual(['7']);
  expect(card('7').className).toContain('Card-green');
});

it('turns a card grey again when it returns to the backlog', () => {
  drop(card('7'), laneBody(2));
  drop(card('7'), laneBody(0), card('1'));
  expect(cardIds(0)[0]).toBe('7');
  expect(card('7').className).toContain('Card-grey');
});

it('reorders cards within a lane', () => {
  drop(card('3'), laneBody(0), card('1'));
  expect(cardIds(0).slice(0, 4)).toEqual(['3', '1', '2', '4']);
});

it('places a card before its drop sibling in another lane', () => {
  drop(card('1'), laneBody(1));
  drop(card('2'), laneBody(1));
  drop(card('3'), laneBody(1), card('2'));
  expect(cardIds(1)).toEqual(['1', '3', '2']);
});

it('reverts the DOM move before React re-renders', () => {
  drake.cancel.mockImplementationOnce(() => {
    // React must not have rendered the move yet when Dragula is told to revert.
    expect(cardIds(0)).toContain('5');
  });
  drop(card('5'), laneBody(1));
  expect(drake.cancel).toHaveBeenCalledWith(true);
  expect(cardIds(1)).toEqual(['5']);
});

it('destroys the Dragula instance on unmount', () => {
  ReactDOM.unmountComponentAtNode(root);
  expect(drake.destroy).toHaveBeenCalled();
});
