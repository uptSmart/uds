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


    it('cross/getToken', function() {
    
    
      fullURL = baseURL + "cross/getToken"

      //TODO Sign
      let param = {
        "fromChainID":1,
        "fromTokenAddress":"0x1234",
        "toChainID":2
      }

      axios
      .post(fullURL,param)
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