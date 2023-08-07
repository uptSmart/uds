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
        crossID : "8ee8bb30b8dd2a11fa658d66beae5af6e3ac94b376bfe90f3b6b31e36ef6cc7c"
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


