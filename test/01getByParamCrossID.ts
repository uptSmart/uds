var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get cross fee', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/getParamsByCrossID', function() {
    
    
      fullURL = baseURL + "cross/getParamsByCrossID"
      let crossIDParam = {
        crossID : "86659ba3eb4d6d97e5ea5b8a821002761c296ccd2b94e689ab194e994b9ce1b6"
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


