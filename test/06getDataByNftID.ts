var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get Data By NftID', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/getDataByNftID', function() {
    
    
      fullURL = baseURL + "cross/getDataByNftID"
      let nftIDParam = {
        nftID : "1001"
      }

      axios
      .post(fullURL,nftIDParam)
      .then( async res => {
        console.log(res.data);

      })
      .catch(error => {

        console.log("error");
        console.error(error)
        

      })      

    });

  

});


