var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/getDataByCrossID', function() {
    
    
      fullURL = baseURL + "cross/getDataByCrossID"
      let crossIDParam = {
        crossID : "0x555837de9e87641dbcc5774ee6b7783bc95f6a5e5b9c12ac39d1ea77300d254d"
      }

      axios
      .post(fullURL,crossIDParam)
      .then( async res => {
        console.log(res.data);

      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


