var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/getDataByFromAddress', function() {
    
    
      fullURL = baseURL + "cross/getDataByFromAddress"
      let fromAddressParam = {
        fromAddress : "0x676A37eC9DC13f95133Fa86dBC053370a9417d8B"
      }

      axios
      .post(fullURL,fromAddressParam)
      .then( async res => {
        console.log(res.data);

      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


