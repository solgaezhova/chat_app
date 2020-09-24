import React from 'react';
import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Icon from '@material-ui/core/Icon';
import makeToast from '../Toaster';

const useStyles = makeStyles((theme) => ({
	button: {
		margin: theme.spacing(1)
	}
}));

const DashboardPage = (props) => {
	const [ chatrooms, setChatrooms ] = React.useState([]);
	const chatroomRef = React.createRef();
	const classes = useStyles();

	const getChatrooms = () => {
		axios
			.get('http://localhost:8000/chatroom', {
				headers: {
					Authorization: 'Bearer ' + localStorage.getItem('CC_Token')
				}
			})
			.then((response) => {
				setChatrooms(response.data);
			})
			.catch((err) => {
				setTimeout(getChatrooms, 3000);
			});
	};
	const createChatroom = () => {
		const chatroom = chatroomRef.current.value;
		const authHeader = { Authorization: 'Bearer ' + localStorage.getItem('CC_Token') };
		axios
			.post('http://localhost:8000/chatroom', { chatroom }, { headers: authHeader })
			.then((response) => {
				makeToast('success', response.data.message);
				props.history.push({
					pathname: '/chatroom/' + response.data.chatroomId,
					chatroomName: response.data.chatroomName
				});
			})
			.catch((err) => {
				if (err && err.response && err.response.data && err.response.data.message)
					makeToast('error', err.response.data.message);
			});
	};

	const handleInputEnter = target => {
		if(target.charCode === 13){
		  createChatroom();    
		} 
	  }

	React.useEffect(() => {
		getChatrooms();
		// eslint-disable-next-line
	}, []);

	return (
		<div className="card">
			<div className="cardBody">
				<div className="inputGroup">
					<label htmlFor="chatroomName">Chatroom Name</label>

					<div className="cardHeader">Chatrooms</div>
					<input
						type="text"
						name="chatroomName"
						id="chatroomName"
						placeholder="ChatterBox Nepal"
						ref={chatroomRef}
						onKeyPress={handleInputEnter}
					/>
				</div>
			</div>
			<Button variant="contained" color="default" onClick={createChatroom}>
				Create Chatroom
			</Button>

			<div className="chatrooms">
				{chatrooms.map((chatroom) => (
					<div key={chatroom._id} className="chatroom">
						<div>{chatroom.name}</div>
						<Link
							to={{
								pathname: '/chatroom/' + chatroom._id,
								chatroomName: chatroom.name
							}}
						>
							<Button
								variant="contained"
								color="default"
								className={classes.button}
								endIcon={<Icon>send</Icon>}
							>
								Join
							</Button>
						</Link>
					</div>
				))}
			</div>
		</div>
	);
};

export default withRouter(DashboardPage);
