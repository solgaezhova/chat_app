const mongoose = require('mongoose');
const Chatroom = mongoose.model('Chatroom');

exports.createChatroom = async (req, res) => {
	const name = req.body.chatroom;

	const nameRegex = /^[A-Za-z\s]+$/;

	if (!nameRegex.test(name)) throw 'Chatroom name can contain only alphabets.';

	const chatroomExists = await Chatroom.findOne({ name });

	if (chatroomExists) throw 'Chatroom with that name already exists!';

	const chatroom = new Chatroom({
		name
	});

	await chatroom.save();

	res.json({
		message: 'Chatroom created!',
		chatroomId: chatroom._id,
		chatroomName: chatroom.name
	});
};

exports.getAllChatrooms = async (req, res) => {
	const chatrooms = await Chatroom.find({});

	res.json(chatrooms);
};

exports.deleteChatroom = async (req, res) => {
	const { chatroomId } = req.body;
	const chatroom = await Chatroom.findById(chatroomId);
  await chatroom.remove();
  
	res.json({
    message: 'Chatroom removed'    
	});
};
