import React from 'react';

class NewUser extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            name: ""
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        console.log("Connecting as " + this.state.name);
        this.context.socket.emit('connected', this.state.name);
    }

    handleChange = (e) => {
        this.setState({name: e.target.value});
    }

    componentDidUpdate() {
        this.refs.input.focus();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input ref="input" type="text" placeholder="Name" value={this.state.name} onChange={this.handleChange} />
                <button type="submit">Sign In</button>
            </form>
        )
    }
}

NewUser.contextTypes = {
    socket: React.PropTypes.object
};

export default NewUser;
