var {
  getCrossID,
  getSignatureFromCrossNFTParam
} = require('../src/utils/common')

var assert = require('assert');
var axios = require('axios')

describe('get Data By NftID', function() {

    let baseURL = "http://localhost:8789/";
    let fullURL = '';


    it('cross/getDataByNftIDAndTokenAddress', function() {
    
    
      fullURL = baseURL + "cross/getDataByNftIDAndTokenAddress"
      let nftIDParam = {
        nftID : "1693814390029475404",
        tokenAddress:"0x0d31bCBd12D0806EC516a3b3AFDDadd8a7cC7D55"
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


