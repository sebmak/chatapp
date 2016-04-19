import ReactDOM from 'react-dom';
import React from 'react';
import IO from 'socket.io-client';
import NewUser from 'modules/new-user';
import * as Plugins from 'modules/plugins';

class Chat extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            socket: IO("http://localhost:8000"),
            user: null,
            messages: [],
            currentMessage: ""
        }

        this.state.socket.on('connected', this.handleConnected);
        this.state.socket.on('message', this.handleMessage);
        this.state.socket.on('joined', this.handleJoined);
        this.state.socket.on('left', this.handleLeft);
        this.state.socket.on('replaceMessage', this.replaceMessage);
    }

    replaceMessage = (message) => {
        console.log('replace message');
        this.setState((curState) => {
            curState.messages.splice(message.index, 1, message.message);
            return curState;
        });
    }

    handleJoined = (data) => {
        this.setState((curState) => {
            curState.messages.push({
                user: {id: "system"},
                message: {
                    text: data.name + " is Connected"
                }
            });
            return curState;
        });
    }

    handleLeft = (data) => {
        this.setState((curState) => {
            curState.messages.push({
                user: {id: "system"},
                message: {
                    text: data.name + " has Left"
                }
            });
            return curState;
        });
    }

    handleMessage = (data) => {
        this.setState((curState) => {
            curState.messages.push(data);
            return curState;
        });
    }

    handleConnected = (data) => {
        console.log("Connected as: " + data.user.name);
        this.setState({
            user: data.user,
            messages: data.messages
        })
    }

    getChildContext() {
        return {
            socket: this.state.socket
        }
    }

    mapMessages = (message) => {
        if(message.type === 'plugin') {
            var P = Plugins[message.pluginName];
            return <li><P key={message.data.id} data={message.data} /></li>
        }
        return <li>{message.message.text}</li>
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.state.socket.emit('send', {
            user: this.state.user,
            timestamp: Date.now(),
            message: {
                text: this.state.currentMessage
            }
        });

        this.setState({
            currentMessage: ""
        });
    }

    handleChange = (e) => {
        this.setState({
            currentMessage: e.target.value
        })
    }

    componentDidUpdate() {
        this.refs.messages.scrollTop = this.refs.messages.scrollHeight;
        if(this.refs.input) {
            this.refs.input.focus();
        }
    }

    render() {
        if(!this.state.user) {
            return <NewUser />
        }
        return (
            <div className="chat">
                <ul ref="messages" className="messages">
                    {this.state.messages.map(this.mapMessages)}
                </ul>
                <form onSubmit={this.handleSubmit}>
                    <input ref="input" type="text" placeholder="type message here..." value={this.state.currentMessage} onChange={this.handleChange} />
                    <button type="submit">-></button>
                </form>
            </div>
        )
    }
}

Chat.childContextTypes = {
    socket: React.PropTypes.object
}

export let render = function(node) {
    ReactDOM.render(<Chat />, node);
}
