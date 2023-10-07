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

      //TODO Sign
      let addDepositRecordParam = {
        crossID : "be14d8b284d528aaef5b089a50a982151fb1dfee651cd335c15edcb8ce3c73b7",
        nftID: ["4004"],
        uri:["https://test1","https://test2"],
        fromAddress:"0x676A37eC9DC13f95133Fa86dBC053370a9417d8B",
        fromChainID:"1170",
        toAddress:["0x9D16512DD5b6C96E9E2196d30ff44F31Ca2d6077","0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8"],
        toChainID:"80001",
        status:0,
        depositTx:"0x7aa578244abe9f020db666c266241312bc986188fde5569992a1ded79db6310d",
        signature:"",
        fee:"123456",
        timespan: Date.now() + randomRangeNumber(100000,999999) + ""
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


var randomRangeNumber = function(minNumber, maxNumber) {
  var range = maxNumber - minNumber;                      //取值范围的差
  var random = Math.random();                             //小于1的随机数
  return minNumber + Math.round(random * range);          //最小数与随机数和取值范围求和，返回想要的随机数字

}