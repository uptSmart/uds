require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-waffle')
require('hardhat-deploy')

module.exports = {
  networks: {

    ropsten: {
        url: `https://ropsten.infura.io/v3/7e31d49d7c8a48f4a4539aff9da768e7`,
        accounts: [
          "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
          "0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650"
        ]
    },
    
    my: {
      url: `http://localhost:20636`,
      accounts: [
        "0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",
        "0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650",
        "0x06f8fb3c6251f0491e2e7abc40f33ae601eaeeb3de444f77d5a5774149ff22a2"
      ]
    },

    hardhat: {
      chainID:100,
      accounts: [
        {privateKey:"0xc03b0a988e2e18794f2f0e881d7ffcd340d583f63c1be078426ae09ddbdec9f5",balance:"10000000000000000000000"},
        {privateKey:"0x54e6e01600b66af71b9827429ff32599383d7694684bc09e26c3b13d95980650",balance:"10000000000000000000000"},
        {privateKey:"0x06f8fb3c6251f0491e2e7abc40f33ae601eaeeb3de444f77d5a5774149ff22a2",balance:"10000000000000000000000"}
      ]
    }

  },
  solidity: '0.6.4',
  //solidity: '0.7.1',
  namedAccounts: {
    deployer: 0
  },
}
