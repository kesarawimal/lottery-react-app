import './App.css';
import web3 from "./web";
import lottery from "./lottery";
import {Component} from "react";

class App extends Component {
    state = {manager: '', players: 0, balance: '', value: 0, message: '', address: ''};

    async componentDidMount() {
        const manager = await lottery.methods.manager().call();
        const players = await lottery.methods.getPlayers().call();
        const balance = await web3.eth.getBalance(lottery.options.address);
        const addresses = await web3.eth.getAccounts();

        this.setState({manager, players: players.length, balance, address: addresses[0]})
    }

    onSubmit = async (event) => {
        event.preventDefault();

        this.setState({message: 'Waiting for the transaction to be filled...'});

        await lottery.methods.enter().send({
            from: this.state.address,
            value: web3.utils.toWei(this.state.value, 'ether')
        });

        this.setState({message: 'You have been entered!'});
    };

    onConnect = async () => {
        const address = await window.ethereum.request({method: 'eth_requestAccounts'});
        this.setState({address});
    };

    pickWinner = async () => {
        this.setState({message: 'Waiting for the transaction to be filled...'});

        await lottery.methods.pickWinner().send({
            from: this.state.address
        });

        this.setState({message: 'A winner has been picked!'});
    };

    isConnected() {
        if (this.state.address) {
            return this.state.address;
        } else {
            return <button type="button" onClick={this.onConnect}>Connect MetaMask</button>;
        }
    }

    isAdmin() {
        if (this.state.manager === this.state.address) {
            return <p><b>Time to pick a winner? </b>
                <button type="button" onClick={this.pickWinner}>Pick Winner</button>
            </p>;
        }
    }

    render() {
        return (
            <div className="App">
                <h2>Lottery Contract!</h2>
                <p>This contract address is <a target="_blank" href={"https://rinkeby.etherscan.io/address/" + lottery.options.address}>{lottery.options.address}</a></p>
                <p>This contract is managed by <a target="_blank" href={"https://rinkeby.etherscan.io/address/" + this.state.manager}>{this.state.manager}</a></p>
                <p>There are currently <b>{this.state.players}</b> people entered, competing to
                    win <b>{web3.utils.fromWei(this.state.balance, 'ether')}</b> ether!</p>
                <br/>
                <p><b>Wanna try your luck? </b>
                    {this.isConnected()}
                </p>
                <br/>
                <form onSubmit={this.onSubmit}>
                    <p>Amount of ether to enter: <input
                        onChange={event => this.setState({value: event.target.value})}/>
                        <button type="submit">Enter</button>
                    </p>
                </form>
                <h3>{this.state.message}</h3>
                <br/>
                {this.isAdmin()}
            </div>
        );
    }
}

export default App;
