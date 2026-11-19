// Pure board-state helpers, kept free of React and the DOM so they can be unit tested.

export const LANES = [
  { key: 'backlog', title: 'Backlog', status: 'backlog' },
  { key: 'inProgress', title: 'In Progress', status: 'in-progress' },
  { key: 'complete', title: 'Complete', status: 'complete' },
];

// Ticket: every shipping request starts in the backlog lane.
export function initialLanes(clients) {
  const lanes = {};
  LANES.forEach(lane => { lanes[lane.key] = []; });
  lanes.backlog = clients.map(client => ({ ...client, status: 'backlog' }));
  return lanes;
}

// Move a client to `targetLane`, placing it before `beforeId` (or at the end when
// `beforeId` is null or not in that lane). The client takes the target lane's status.
// Returns a new lanes object; returns the input unchanged when the client is unknown.
export function moveClient(lanes, clientId, targetLane, beforeId) {
  const target = LANES.find(lane => lane.key === targetLane);
  if (!target) return lanes;

  let moved = null;
  const next = {};
  Object.keys(lanes).forEach(key => {
    next[key] = lanes[key].filter(client => {
      if (client.id === clientId) {
        moved = client;
        return false;
      }
      return true;
    });
  });
  if (!moved) return lanes;

  const card = { ...moved, status: target.status };
  const laneClients = next[targetLane];
  const index = beforeId == null ? -1 : laneClients.findIndex(client => client.id === beforeId);
  next[targetLane] = index === -1
    ? [...laneClients, card]
    : [...laneClients.slice(0, index), card, ...laneClients.slice(index)];
  return next;
}
