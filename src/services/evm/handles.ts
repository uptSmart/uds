const { ethers } = require('hardhat')
import {
    getContractTx,
    getUnsignTx
  } from '../../utils'

var txDecoder = require(
    'ethereum-tx-decoder'
);


export const handles = {

    getEvmNFT: async (contractAddress, wallet,nftID) => {
       
        try {
            console.log("xxl come  to getEvmNFT 0 ",nftID);

            const Factory__ERC721 = await ethers.getContractFactory('ERC721MinterBurnerPauser')
            let ERC721 = await Factory__ERC721.connect(wallet).attach(contractAddress);

            console.log("xxl getEvmNFT 1 ",nftID);
            let uri = await ERC721.tokenURI(nftID);
            return uri

        } catch (e) {

            console.log("xxl getEvmNFT 2 ",e);
            console.log(e);
            return null
        }
    
    },

    mintNFT: async (contractAddress, wallet,nftRec) => {

        try {
            console.log("xxl come  to getEvmNFT 0 ",nftRec,wallet.address,contractAddress);

            const Factory__ERC721 = await ethers.getContractFactory('UptickNFT721')
            let ERC721 = await Factory__ERC721.connect(wallet).attach(contractAddress);

            let txObj = await ERC721.mint(
                nftRec.fromAddress,
                nftRec.nftID,
                nftRec.uri
            );
            
            // console.log("------ xxl aaaa : ",txObj );
            let repObj = await txObj.wait();
            console.log("------  xxl bbbb repObj : " ,repObj);
            return repObj["status"];

        } catch (e) {

            console.log("xxl mintNFT 2 ",e);
            console.log(e);
            return null
        }

    }

}

