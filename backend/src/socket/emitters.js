// REST controllers (chat.controller.js) need to push real-time updates
// after a successful mutation — e.g. proposePrice emits `price_updated` so
// the other participant's open chat updates live, even though the request
// itself came in over HTTP, not a socket. This module holds a single
// reference to the `io` instance (set once from chat.socket.js when sockets
// are initialized) so controllers can emit without importing socket setup
// directly and risking a circular require.

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

function emitToUsers(userIds, event, payload) {
  if (!ioInstance) return;
  const rooms = userIds.map((id) => `user:${id}`);
  ioInstance.to(rooms).emit(event, payload);
}

function emitToListing(listingId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`listing:${listingId}`).emit(event, payload);
}

module.exports = { setIO, emitToUser, emitToUsers, emitToListing };