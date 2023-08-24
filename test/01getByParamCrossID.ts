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
        crossID : "5f41a1ec8d2ce469cb633983617af758cb8f9d25e2de3a007480ab5d2d48f3f8"
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


