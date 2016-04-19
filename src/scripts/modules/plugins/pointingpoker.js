import React from 'react';
import IO from 'socket.io-client';

class PointingPoker extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            options: this.optionsToArray(props.data.options),
            socket: IO('http://localhost:8000/plugin/pointingpoker/' + props.data.id)
        }

        this.state.socket.on('unvote', this.handleUnVote);
        this.state.socket.on('vote', this.handleVote);
    }

    handleUnVote = (val) => {
        console.log("unvote: " + val);
        this.setState((curState) => {
            for(var key in curState.options) {
                if(curState.options[key].val === val) {
                    curState.options[key].count--;
                    return curState;
                }
            }
        });
    }

    handleVote = (val) => {
        console.log("vote: " + val);
        this.setState((curState) => {
            for(var key in curState.options) {
                if(curState.options[key].val === val) {
                    curState.options[key].count++;
                    return curState;
                }
            }
        });
    }

    optionsToArray = (options) => {
        var out = [];
        for(var key in options) {
            out.push({
                label: options[key],
                val: key,
                count: 0
            });
        }
        return out;
    }

    vote = (e) => {
        var val = e.target.dataset.val;
        if(this.state.current) {
            this.state.socket.emit('unvote', this.state.current);
            this.handleUnVote(this.state.current);
        }
        this.setState({current: val});
        this.handleVote(val);
        this.state.socket.emit('vote', val);

    }

    mapOptions = (option) => {
        return <button onClick={this.vote} data-val={option.val}>{option.label} | {option.count}</button>
    }

    componentWillUnmount() {
        this.state.socket.disconnect();
    }

    close = () => {
        this.state.socket.emit('close');
    }

    render() {
        return (
            <div>
                <h1>Pointing Poker | {this.props.data.data.key}</h1>
                <hr />
                {this.state.options.map(this.mapOptions)}
                <hr />
                <button onClick={this.close}>Get Results</button>
            </div>
        )
    }
}

PointingPoker.contextTypes = {
    socket: React.PropTypes.object
};

export default PointingPoker;
