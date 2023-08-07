var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/registerCrossNFTTxs', function() {
    
    
      fullURL = baseURL + "cross/registerCrossNFTTxs"
      let priKey = "a6392433fe30f2bf8564228240eddd41c7ad12ab5332438254054896790ceebe";
      let registerCrossNFTTxParam = {
        crossID : "",
        nftID: ["1","2"],
        uri:["https://test1","https://test2"],
        fromAddress:"0x676A37eC9DC13f95133Fa86dBC053370a9417d8B",
        fromChainID:"1170",
        toAddress:["0x9D16512DD5b6C96E9E2196d30ff44F31Ca2d6077","0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8"],
        toChainID:"421613",
        timespan:Date.now(),
        signObj:null,
        fee:"123456",
        origin:0,
      }

      //get cross ID
      console.log("###xxl init Tx Param : ",registerCrossNFTTxParam);
      registerCrossNFTTxParam["crossID"] = getCrossID(registerCrossNFTTxParam);
      console.log("###xxl add crossID Param : ",registerCrossNFTTxParam);

      //sig cross param
      registerCrossNFTTxParam["signObj"] = getSignatureFromCrossNFTParam(registerCrossNFTTxParam,priKey);
      console.log("###xxl add signObj Param : ",registerCrossNFTTxParam);

      axios
      .post(fullURL,registerCrossNFTTxParam)
      .then( async res => {

        console.log(res.data);

      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


