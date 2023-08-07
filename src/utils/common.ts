import { toHexString } from '@eth-optimism/core-utils'
import {
  CROSS_TYPE,
  CHAIN_IDS
} from './constants'
var crypto = require('crypto');
let Web3 = require('web3');

/**
 * Basic timeout-based async sleep function.
 * @param ms Number of milliseconds to sleep.
 */
export const sleep = async (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const assert = (condition: () => boolean, reason?: string) => {
  try {
    if (condition() === false) {
      throw new Error(`Assertion failed: ${reason}`)
    }
  } catch (err) {
    throw new Error(`Assertion failed: ${reason}\n${err}`)
  }
}

export const toRpcHexString = (n: number): string => {
  if (n === 0) {
    return '0x0'
  } else {
    return '0x' + toHexString(n).slice(2).replace(/^0+/, '')
  }
}

export const padHexString = (str: string, length: number): string => {
  if (str.length === 2 + length * 2) {
    return str
  } else {
    return '0x' + str.slice(2).padStart(length * 2, '0')
  }
}


export const randomStr = (length: number): string => {
  let random = '';
  let lexicon = 'abcdefghijklmnopqrstuvwxyz'
  for (let i=0; i<length; i++) {
    let randomIndex = Math.floor(Math.random()*1000)%lexicon.length;
    random += lexicon.substr(randomIndex,1);
  }
  return random;

}

// old nftid iris to evm 
// export const  NFTIDIris2Evm = (irisNFDID) :string =>{

//   let lIrisNFDID = irisNFDID.toLowerCase();
//   let nLen = lIrisNFDID.length;
//   let HEXString = "0123456789abcdef";
//   let ret = "";
//   for(var i = 0 ; i < nLen ; i ++){
//       let eachData = lIrisNFDID[i];
//       let isExist = HEXString.includes(eachData);
//       if(isExist){
//           ret += eachData;
//       }else{
//           ret += eachData.charCodeAt(0).toString(16)
//       }
//   }

//   if(ret.length % 2 != 0){
//     ret = ret + "0"
//   }
//   ret = "0x" + ret;

//   return ret;
// }

export const  NFTIDIris2Evm = (irisNFDID,denomID) :string =>{

  let orgKey = denomID + irisNFDID ;
  let md5 = crypto.createHash('md5');
  let result = md5.update(orgKey).digest('hex').substr(8,16);

  //fix the 0 start bug
  if(result.substr(0,1) == "0"){
    result = "1" + result.substr(1,15)
  }

  return "0x" + result
}

export const NFTIDEvm2Iris = (evmNFDID) :string =>{
 
  return parseInt(evmNFDID).toString(16);
}

 //for not have problem of ios and android
//type 0: iris => plg 1: plg=>iris 
export const serializeCrossData = (json :any,type:number) :string =>{

  let sData = json.fromAddress + json.fromChainID + json.toAddress + json.toChainID + json.fee;
  let len = json.data.length;
  if(type == CROSS_TYPE.IRIS2PLG){
    for(var i = 0 ; i < len ; i ++){
      sData += json.data[i].id + json.data[i].denomID
    }
  }else if(type == CROSS_TYPE.PLG2IRIS){
    for(var i = 0 ; i < len ; i ++){
      sData += json.data[i].id.toString()
    }
  }
  
  sData += json.origin.toString() + json.timestamp;
 
  return sData;

}

export const getCrossType = (fromChainID,toChainID) :number=>{

  if(
    (fromChainID == CHAIN_IDS.IRIS_MAINNET ||  fromChainID == CHAIN_IDS.IRIS_TETNET)
    &&
    (toChainID == CHAIN_IDS.PLG_MAINNET ||  toChainID == CHAIN_IDS.PLG_TETNET)
  ){

    return CROSS_TYPE.IRIS2PLG
  
  }else if(
    (fromChainID == CHAIN_IDS.PLG_MAINNET ||  fromChainID == CHAIN_IDS.PLG_TETNET)
    &&
    (toChainID == CHAIN_IDS.IRIS_MAINNET ||  toChainID == CHAIN_IDS.IRIS_TETNET)
  ){
  
    return CROSS_TYPE.PLG2IRIS

  }else{
  
    return CROSS_TYPE.NO_CROSS

  }
}

export const isNull = (exp) :boolean =>{

  return !exp && typeof(exp) != 'undefined' && exp!=0;
} 



export const getContractTx = async(abi,addresss,funcName,params,eth) : Promise<any> =>{

  const callContract = new eth.Contract(
    abi,
    addresss
  );

  const tx = await callContract.methods[funcName](
    ...params
  );

  return tx;
}



export const getUnsignTx = async(tx,from,to,value,chainId,gasLimit,eth) : Promise<any> =>{

  let gasPrice  = 0;
  let data ;
  let nonce ;
  try{
      gasPrice = await eth.getGasPrice();
  }catch(e){
     gasPrice = 1000000000;
     console.log("xxl service getUnsignTx  getGasPrice exception");
  }

  try{

      console.log("xxl 1");
      data = tx.encodeABI();
      console.log("xxl 2 : " + from);
      nonce = await eth.getTransactionCount(from);

      //console.log("xxl getUnsignTx 11.... : " + nonce);
      //TODO
      const unsignedTx = {
        from,
        to, 
        value,
        data,
        gasPrice,
        gasLimit,
        nonce,
        chainId
    };

    return unsignedTx;

  }catch(e){
    
    console.log("xxl service getUnsignTx exception ...");
    console.log(e);

    return null;
  }

}

export const hexToString = (str):string =>{
    return BigInt(str).toString(10);
}

export const  stringToHex = (str):string =>{

  let bufStr = Buffer.from(str, 'utf8');
  return bufStr.toString('hex');

}


export const dec2hex = (str):string => { 
  var dec = str.toString().split(''), sum = [], hex = [], i, s
  while(dec.length){
      s = 1 * dec.shift()
      for(i = 0; s || i < sum.length; i++){
          s += (sum[i] || 0) * 10
          sum[i] = s % 16
          s = (s - sum[i]) / 16
      }
  }
  while(sum.length){
      hex.push(sum.pop().toString(16))
  }
  return hex.join('')
}


export const hex2a = (hexx):string => {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}


export const getCrossID = (registerCrossNFTTxParam):string => {

  let crossString = crossNFTSerial(registerCrossNFTTxParam);
  console.log("###xxl cross string :(%s)",crossString);
  return Web3.utils.sha3(crossString);

}


export const getSignatureFromCrossNFTParam = (registerCrossNFTTxParam,privKey:string):string => {

  let crossString = crossNFTSerial(registerCrossNFTTxParam);
  let web = new Web3();

  console.log("###xxl Signature : ",crossString,privKey);
  let sign = web.eth.accounts.sign(crossString, privKey);
  return sign;

}


//
// let registerCrossNFTTxParam = {
//   crossID : "",
//   nftID: ["1","2"],
//   url:["https://test1","https://test2"],
//   fromAddress:"0x676A37eC9DC13f95133Fa86dBC053370a9417d8B",
//   fromChainID:"1170",
//   toAddress:["0x9D16512DD5b6C96E9E2196d30ff44F31Ca2d6077","0xfF7d59D9316EBA168837E3eF924BCDFd64b237D8"],
//   toChainID:"421613",
//   signature:"",
//   fee:"123456",
//   orgin:0,
// }
function crossNFTSerial(registerCrossNFTTxParam){


  let keys=["nftID","uri","fromAddress","fromChainID","toAddress","toChainID","timespan"];
  let keyLen = keys.length;
  let result = "";

  for(let i = 0 ;i < keyLen ; i++){
    
    let isKeyExist = registerCrossNFTTxParam.hasOwnProperty(keys[i])
    if( !isKeyExist ){ return ""; }

    let isArray = Array.isArray(registerCrossNFTTxParam[keys[i]])
    if(!isArray){
      result += registerCrossNFTTxParam[keys[i]].toString();
    }else{
      result += registerCrossNFTTxParam[keys[i]].toString();
    }
  }

  return result.toLowerCase();


}


export function toHexStringL(bytes) {

 for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
}
 console.log("###xxl hex is : ",hex.join(""))
 
}

export function getTokenFromChainID(tokenList,chainId) {


  if(chainId == tokenList.uptickChainId){
    return tokenList.uptickToken
  }else if(chainId == tokenList.polygonChainId){
    return tokenList.polygonToken
  }else if(chainId == tokenList.bscChainId){
    return tokenList.bscToken
  }else if(chainId == tokenList.arbitrumChainId){
    return tokenList.arbitrumToken
  }else if(chainId == tokenList.ethChainId){
    return tokenList.ethToken
  }

  return "";
  
 }

 export function getWalletFromChainID(state,tokenList,chainId) {

  if(chainId == tokenList.uptickChainId){
    return state.uptickWallet
  }else if(chainId == tokenList.polygonChainId){
    return state.polygonWallet
  }else if(chainId == tokenList.bscChainId){
    return state.bscWallet
  }else if(chainId == tokenList.arbitrumChainId){
    return state.arbitrumWallet
  }else if(chainId == tokenList.ethChainId){
    return state.ethWallet
  }

  return null;
  
 }



//
import { Wallet} from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
export function setWallet(rpc,privateKey){

    //2.add wallet
    const uptickRpcProvider :JsonRpcProvider =
    typeof rpc === 'string'
      ? new JsonRpcProvider(rpc)
      : rpc

    //private key
    return new Wallet(privateKey,uptickRpcProvider); 

}
