let onlineUsers = [];

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
  });

  //Socke disconnect
  socket.on("disconnect", () => {
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
}
