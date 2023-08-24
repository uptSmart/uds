var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/getDataByAddress', function() {
    
    
      fullURL = baseURL + "cross/getDataByAddress"
      let addressParam = {
        address : "0x676a37ec9dc13f95133fa86dbc053370a9417d8b"
      }

      axios
      .post(fullURL,addressParam)
      .then( async res => {
        console.log(res.data);
        
      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


