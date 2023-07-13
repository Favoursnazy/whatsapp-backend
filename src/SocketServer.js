let onlineUsers = [];
const EditData = (data, id, call) => {
  const newData = data.map((item) =>
    item.userId === id ? { ...item, call } : item
  );

  return newData;
};

export default function (socket, io) {
  // user joins or open the application
  socket.on("join", (user) => {
    socket.join(user);
    //add joined user to oline users
    if (!onlineUsers.some((u) => u.userId === user)) {
      onlineUsers.push({ userId: user, socketId: socket.id });
    }
    //send online users to frontend
    io.emit("get-online-users", onlineUsers);

    //send socket id
    io.emit("setup_socket", socket.id);
  });

  //Socke disconnect
  socket.on("disconnect", () => {
    const data = onlineUsers.find((user) => user.socketId === socket.id);
    if (data) {
      const callUser = onlineUsers.find((user) => user.userId === data.call);
      if (callUser) {
        onlineUsers = EditData(onlineUsers, callUser.userId, null);
        socket.to(`${callUser.socketId}`).emit("callDisconnect");
      }
    }
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit("get-online-users", onlineUsers);
  });

  //join a conversation room
  socket.on("join_conversation", (conversation) => {
    socket.join(conversation);
  });

  //send and recieve message
  socket.on("send_message", (message) => {
    let conversation = message.conversation;
    if (!conversation.users) return;
    conversation.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.in(user._id).emit("recieved_message", message);
    });
  });

  //Tying
  socket.on("typing", (conversation) => {
    socket.in(conversation).emit("typing", conversation);
  });

  socket.on("stop_typing", (conversation) => {
    socket.in(conversation).emit("stop_typing");
  });

  //call user
  socket.on("CallUser", (data) => {
    onlineUsers = EditData(onlineUsers, data.sender, data.reciever);

    const client = onlineUsers.find((user) => user.userId === data.reciever);

    if (client) {
      if (client.call) {
        onlineUsers = EditData(onlineUsers, data.sender, null);
        socket.emit("userBusy", data);
      } else {
        onlineUsers = EditData(onlineUsers, data.reciever, data.sender);
        socket.to(`${client.socketId}`).emit("callUserToClient", data);
      }
    }
  });

  // answer user call
  socket.on("answer_call", (data) => {
    io.to(data.to).emit("call_accepted", data.signal);
  });

  // End call
  socket.on("endCall", (data) => {
    const client = onlineUsers.find((user) => user.userId === data.sender);

    if (client) {
      socket.to(`${client.socketId}`).emit("endCallToClient", data);
      onlineUsers = EditData(onlineUsers, client.userId, null);

      if (client.call) {
        const clientCall = onlineUsers.find(
          (user) => user.userId === client.call
        );
        clientCall &&
          socket.to(`${clientCall.socketId}`).emit("endCallToClient", data);
        onlineUsers = EditData(onlineUsers, client.call, null);
      }
    }
  });
}
