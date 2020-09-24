require("dotenv").config();

const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex:true,
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

//Bringing in the Models
const User = require("./models/User");
const Message = require("./models/Message");
const Chatroom = require("./models/Chatroom");

const app = require("./app");

const server = app.listen(8000, () => {
  console.log("Server listening on port 8000");
});

const io = require("socket.io")(server);
const jwt = require("jwt-then");

// Socket.io Events

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = await jwt.verify(token, process.env.SECRET);
    socket.userId = payload.id;
    next();
  } catch (err) {}
});

io.on("connection", (socket) => {
  console.log("Connected: " + socket.userId);

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });

  socket.on("joinRoom", ({ chatroomId, userId }) => {
    socket.join(chatroomId);
    socket.broadcast.to(chatroomId).emit('newMessage', {name: 'admin', message: `A new user ${userId} has joined the chatroom!`});
    console.log("A user joined chatroom: " + chatroomId);
  });

  socket.on("leaveRoom", ({ chatroomId, userId }) => {
    socket.leave(chatroomId);
    socket.broadcast.to(chatroomId).emit('newMessage', {name: 'admin', message: `User ${userId} has left the chatroom...`});
    console.log("A user left chatroom: " + chatroomId);
  });

  socket.on("chatroomMessage", async ({ chatroomId, message }) => {
    if (message.trim().length > 0) {
      const user = await User.findOne({ _id: socket.userId });
      const newMessage = new Message({
        chatroom: chatroomId,
        user: socket.userId,
        message,
      });
     
      io.to(chatroomId).emit("newMessage", {
        message,
        name: user.name,
        userId: socket.userId,
      });
      await newMessage.save();
    }
  });
});
