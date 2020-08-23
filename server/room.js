let rooms = {
  //[id]: {
  //  name: roomName,
  //  users: [user]
  //}
};

const createRoom = (userId, roomName) => {
  let newRoom = { name: roomName, users: [userId] };

  if (!rooms[roomName]) {
    rooms[roomName] = newRoom;
  } else {
    return { error: "Room Already Exists!" };
  }
  return { room: newRoom };
};

const joinRoom = (userId, roomName) => {
  let room = rooms[roomName];

  if (!room) return { error: "No such room exists" };
  if (room.users.length == 2) return { error: "Room is full" };

  room.users.push(userId);
  return { room };
};

const deleteRoom = (userId) => {
  const roomNames = Object.keys(rooms);
  var room;
  for (var i = 0; i < roomNames.length; i++) {
    if (rooms[roomNames[i]].users.includes(userId)) {
      room = Object.assign({}, rooms)[roomNames[i]];
      delete rooms[roomNames[i]];
    }
  }
  return room;
};

module.exports = { createRoom, joinRoom, deleteRoom };
