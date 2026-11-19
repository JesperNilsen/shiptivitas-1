import { LANES, initialLanes, moveClient } from './boardState';

const ids = clients => clients.map(client => client.id);

const sample = () => initialLanes([
  { id: '1', name: 'A', status: 'in-progress' },
  { id: '2', name: 'B', status: 'complete' },
  { id: '3', name: 'C', status: 'backlog' },
  { id: '4', name: 'D' },
]);

describe('LANES', () => {
  it('defines three swimlanes in board order', () => {
    expect(LANES.map(lane => lane.status)).toEqual(['backlog', 'in-progress', 'complete']);
  });
});

describe('initialLanes', () => {
  it('puts every client in the backlog with backlog status', () => {
    const lanes = sample();
    expect(ids(lanes.backlog)).toEqual(['1', '2', '3', '4']);
    expect(lanes.backlog.every(client => client.status === 'backlog')).toBe(true);
    expect(lanes.inProgress).toEqual([]);
    expect(lanes.complete).toEqual([]);
  });
});

describe('moveClient', () => {
  it('reorders a card upward within its lane', () => {
    const next = moveClient(sample(), '3', 'backlog', '1');
    expect(ids(next.backlog)).toEqual(['3', '1', '2', '4']);
  });

  it('reorders a card downward within its lane', () => {
    const next = moveClient(sample(), '1', 'backlog', '4');
    expect(ids(next.backlog)).toEqual(['2', '3', '1', '4']);
  });

  it('moves a card to the end of its lane when dropped with no sibling', () => {
    const next = moveClient(sample(), '1', 'backlog', null);
    expect(ids(next.backlog)).toEqual(['2', '3', '4', '1']);
  });

  it('moves a card into another lane and takes that lane status', () => {
    const next = moveClient(sample(), '2', 'inProgress', null);
    expect(ids(next.backlog)).toEqual(['1', '3', '4']);
    expect(next.inProgress).toEqual([{ id: '2', name: 'B', status: 'in-progress' }]);
  });

  it('inserts before the given sibling in the target lane', () => {
    let lanes = moveClient(sample(), '1', 'complete', null);
    lanes = moveClient(lanes, '2', 'complete', null);
    lanes = moveClient(lanes, '3', 'complete', '2');
    expect(ids(lanes.complete)).toEqual(['1', '3', '2']);
    expect(lanes.complete.every(client => client.status === 'complete')).toBe(true);
  });

  it('can move a card back to the backlog', () => {
    let lanes = moveClient(sample(), '1', 'complete', null);
    lanes = moveClient(lanes, '1', 'backlog', '2');
    expect(ids(lanes.backlog)).toEqual(['1', '2', '3', '4']);
    expect(lanes.backlog[0].status).toBe('backlog');
    expect(lanes.complete).toEqual([]);
  });

  it('appends when the sibling id is not in the target lane', () => {
    const next = moveClient(sample(), '1', 'backlog', 'missing');
    expect(ids(next.backlog)).toEqual(['2', '3', '4', '1']);
  });

  it('returns the input unchanged for an unknown client or lane', () => {
    const lanes = sample();
    expect(moveClient(lanes, 'missing', 'complete', null)).toBe(lanes);
    expect(moveClient(lanes, '1', 'nowhere', null)).toBe(lanes);
  });

  it('does not mutate the input', () => {
    const lanes = sample();
    const before = JSON.stringify(lanes);
    moveClient(lanes, '1', 'complete', null);
    expect(JSON.stringify(lanes)).toBe(before);
  });
});
