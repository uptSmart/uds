var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://13.213.149.227:8789/";
    let fullURL = '';


    it('cross/getDataByAddress', function() {
    
    
      fullURL = baseURL + "cross/getDataByAddress"
      let addressParam = {
        address : "0xe6391ac3d333aedbbd8b398e524509d705f3e23e"
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


