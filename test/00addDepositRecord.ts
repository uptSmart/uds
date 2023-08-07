import { utils } from "mocha";

var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/addDepositRecord', function() {
    
    
      fullURL = baseURL + "cross/addDepositRecord"

      const hexCrossID = utils
      //TODO Sign
      let addDepositRecordParam = {
        crossID : "0x00000000000000000000000000000000001",
        nftID: ["1","2"],
        uri:["https://test1","https://test2"],
        fromAddress:"0x676A37eC9DC13f95133Fa86dBC053370a9417d8B",
        fromChainID:"1170",
        toAddress:["0x9D16512DD5b6C96E9E2196d30ff44F31Ca2d6077","0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8"],
        toChainID:"421613",
        timespan:Date.now(),
        status:0,
        depositTx:"0x00000000000000000000000000000000002",
        signature:"",
        fee:"123456"
      }

      axios
      .post(fullURL,addDepositRecordParam)
      .then( async res => {

        console.log(res.data);

      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


