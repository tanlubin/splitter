const Web3 = require("web3");
const net = require("net");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas:500000,
    },
    
    net72:{
      host: "localhost",
      port: 8545,
      network_id: 72, 
      gas:500000,
    },
    ropsten: {
      provider: new Web3.providers.IpcProvider(process.env['HOME'] + "/.ethereum/geth.ipc", net),
      network_id: 3,
      gas:500000,
    }
  }
};
