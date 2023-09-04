var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://13.213.149.227:8789/";
    let fullURL = '';


    it('cross/getDataByToAddress', function() {
    
    
      fullURL = baseURL + "cross/getDataByToAddress"
      let toAddressParam = {
        toAddress : "0xE6391Ac3D333AeDbbd8B398E524509d705f3E23e"
      }

      axios
      .post(fullURL,toAddressParam)
      .then( async res => {
        console.log(res.data);

      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


