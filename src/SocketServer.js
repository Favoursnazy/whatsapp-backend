import { MessageModel } from "./models/index.js";
import { populatedMessage } from "./services/message.service.js";
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

  //Socket disconnect
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
    if (conversation) {
      socket.join(conversation);
    } else {
      return;
    }
  });

  //send and recieve message
  socket.on("send_message", (message) => {
    let conversation = message.message.conversation;
    let newMessage = message.message;
    let totalUnreadMessage = message.totalUnreadMessages;
    if (!conversation.users) return;
    conversation.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket
        .in(user._id)
        .emit("recieved_message", { newMessage, totalUnreadMessage });
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

  // send read to reciepnt
  socket.on("updateRead", (payload) => {
    const users = payload.users;
    if (!users) return;
    users.forEach((user) => {
      if (user._id !== payload.latestMessage.sender._id) return;
      socket.in(user._id).emit("recieved_read", payload);
    });
  });

  // listen for update message status
  socket.on("update_read_message", async (message) => {
    const messageId = message._id;
    const newMessage = await MessageModel.findByIdAndUpdate(messageId, {
      status: "read",
    });
    const populatedMsg = await populatedMessage(newMessage._id);
    const users = populatedMsg.conversation.users;
    if (!users) return;
    users.forEach((user) => {
      if (user._id.toString() === populatedMsg.sender._id.toString()) {
        socket.in(user._id.toString()).emit("user_read_message", populatedMsg);
      } else {
        return;
      }
    });
  });
}
