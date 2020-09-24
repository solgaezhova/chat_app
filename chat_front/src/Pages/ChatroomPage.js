import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import AvTimerIcon from '@material-ui/icons/AvTimer';
import makeToast from '../Toaster';

const useStyles = makeStyles((theme) => ({
	button: {
		margin: theme.spacing(1)
	}
}));

const ChatroomPage = ({ history, match, location, socket }) => {
	const chatroomId = match.params.id;
	const [ messages, setMessages ] = React.useState([]);
	// const [ users, setUsers ] = React.useState([]);
	const [ userId, setUserId ] = React.useState('');
	const messageRef = React.useRef();
	const classes = useStyles();

	const sendMessage = () => {
		if (socket) {
			socket.emit('chatroomMessage', {
				chatroomId,
				message: messageRef.current.value
			});
			console.log("messageRef.current.value");
			messageRef.current.value = '';
		}
	};

	const handleInputEnter = (target) => {
		if (target.charCode === 13) {
			sendMessage();
		}
	};
	
	const handleLogout = () => {
		window.localStorage.clear();
		window.location.reload(true);
		window.location.replace('/login');
	};

	const deleteChatroom = () => {
		const authHeader = { Authorization: 'Bearer ' + localStorage.getItem('CC_Token') };
		axios
			.delete(`http://localhost:8000/chatroom/${chatroomId}`, {
				headers: authHeader,
				data: { chatroomId }
			})
			.then((response) => {
				makeToast('success', response.data.message);
				history.push('/dashboard');
			})
			.catch((err) => {
				if (err && err.response && err.response.data && err.response.data.message)
					makeToast('error', err.response.data.message);
			});
	};

	React.useEffect(
		() => {
			const token = localStorage.getItem('CC_Token');
			if (token) {
				const payload = JSON.parse(atob(token.split('.')[1]));
				setUserId(payload.id || 'admin');
			}
			if (socket) {
				socket.on('newMessage', (message) => {
					console.log('Message recieved');
					console.log(message);
					const newMessages = [ ...messages, message ];
					setMessages(newMessages);
				});
			}
		},
		//eslint-disable-next-line
		[ messages ]
	);

// Getting user by UserId

	// React.useEffect(
	// 	() => {
	// 		axios
	// 			.get('http://localhost:8000/user', {
	// 				params: { userId }
	// 			})
	// 			.then((response) => {
	// 				const user = response.data;
	// 				console.log(user);
	// 				const newUsers = [ ...users, user ];
	// 				setUsers(newUsers);
	// 			})
	// 			.catch((err) => {
	// 				throw err;
	// 			});
	// 	},
	// 	//eslint-disable-next-line
	// 	[ userId ]
	// );

	React.useEffect(() => {
		if (socket) {
			socket.emit('joinRoom', {
				chatroomId,
				userId
			});
		}
		return () => {
			console.log('unmount');
			//Component Unmount
			if (socket) {
				socket.emit('leaveRoom', {
					chatroomId,
					userId
				});
			}
		};
		//eslint-disable-next-line
	}, []);

	return (
		<div className="chatroomPage">
			<div className="chatroomSection">
				<div className="cardHeader">{location.chatroomName || 'CHATROOM'}</div>
				{/* <div className="users">{users.map((user) => <span key={user.name} className="user">{user.name}</span>)}
				</div> */}
				<div className="chatroomContent">
					{messages.map((message, i) => (
						<div key={i} className="message">
							<span
								className={
									userId === message.userId ? (
										'ownMessage'
									) : userId === 'admin' ? (
										'adminMessage'
									) : (
										'otherMessage'
									)
								}
							>
								{message.name}:
							</span>{' '}
							{message.message}
						</div>
					))}
				</div>
				<div className="chatroomActions">
					<div>
						<input
							type="text"
							name="message"
							placeholder="Say something!"
							ref={messageRef}
							onKeyPress={handleInputEnter}
						/>
					</div>
					<div>
						<Button
							onClick={sendMessage}
							variant="contained"
							className={classes.button}
							endIcon={<Icon>send</Icon>}
						>
							Send
						</Button>
					</div>
					<BottomNavigation showLabels className={classes.root}>
						<BottomNavigationAction
							label="LEAVE A ROOM"
							icon={<ExitToAppIcon fontSize="large" />}
							onClick={() => {
								history.push('/dashboard');
							}}
						/>
						<BottomNavigationAction
							label="REMOVE THIS ROOM"
							icon={<DeleteOutlineIcon fontSize="large" />}
							onClick={deleteChatroom}
						/>
						<BottomNavigationAction
							label="LOGOUT"
							icon={<AvTimerIcon fontSize="large" />}
							onClick={handleLogout}
						/>/>
					</BottomNavigation>
				</div>
			</div>
		</div>
	);
};

export default withRouter(ChatroomPage);
