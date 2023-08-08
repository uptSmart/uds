/* Imports: External */
import { BaseService } from '@eth-optimism/service-base';
import MySQL from '../../db/mysql';
import {FeeModel} from '../../model/feeModel';
import {NFTModel} from '../../model/nftModel';
import express, { json, Request, Response } from 'express'
import cors from 'cors'
import qs from 'qs';
import {APIData} from '../../types'
import {
  validators,
  errResphonse,
  okResphonse,
  ERR_MSG,
  getCrossID,
  getTokenFromChainID,
  setWallet,
  getWalletFromChainID,
  serializeCrossData,
  getCrossType,
  isNull,
  randomStr,
  CROSS_TYPE,
  CROSS_STATUS,
  NFTIDIris2Evm,
  stringToHex,
  dec2hex,
  hexToString,
  hex2a,
  toHexStringL
} from '../../utils'
import { BigNumber,Wallet,utils } from 'ethers'
import { JsonRpcProvider, UrlJsonRpcProvider } from '@ethersproject/providers'
import { handles as evmHandles  } from '../evm/handles';


import { toHexString } from '@eth-optimism/core-utils';


var axios = require('axios');
let Web3 = require('web3');

interface DBConf{
  host:     string
  user:     string
  password: string
  name:     string
  port:     number
}

interface ChainToken {

  uptickToken:         string
  uptickChainId:       string
  uptickRPC:           string

  polygonToken:        string
  polygonChainId:      string
  polygonRPC:          string

  bscToken:            string
  bscChainId:          string
  bscRPC:              string
  
  arbitrumToken:       string
  arbitrumChainId:     string
  arbitrumRPC:         string
  
  ethToken:            string
  ethChainId:          string
  ethRPC:              string
}


export interface DataTransportServiceOptions {
    
    //DB
    dbConf:       DBConf

    //host
    serverHost:   string
    serverPort:   number

    chainToken:ChainToken
    adminPriv:    string

}


export class DataTransportService extends BaseService<DataTransportServiceOptions> {
    
    protected name = 'Uptick Data Service'
    protected cross_id_random_length = 3
  
    private state: {
        db:any,
        app: express.Express,
        server: any,

        web3:any,

        dbConf:DBConf,
        client:any,

        uptickWallet:Wallet,
        polygonWallet:Wallet,
        bscWallet:Wallet,
        arbitrumWallet:Wallet,
        ethWallet:Wallet,
      
    } = {} as any
  
    protected async _init(): Promise<void> {

      //1.init db
      this.state.dbConf = this.options.dbConf
      MySQL.createPool(
        this.state.dbConf.host,
        this.state.dbConf.user,
        this.state.dbConf.password,
        this.state.dbConf.name,
        this.state.dbConf.port
      );
      await MySQL.getConnection();
      this.state.db = MySQL;

      this.state.web3 = new Web3();


      //2.add wallet
      this.state.uptickWallet = setWallet(this.options.chainToken.uptickRPC,this.options.adminPriv);
      this.state.polygonWallet = setWallet(this.options.chainToken.polygonRPC,this.options.adminPriv);
      this.state.bscWallet = setWallet(this.options.chainToken.bscRPC,this.options.adminPriv);
      this.state.arbitrumWallet = setWallet(this.options.chainToken.arbitrumRPC,this.options.adminPriv);
      this.state.ethWallet = setWallet(this.options.chainToken.ethRPC,this.options.adminPriv);
      
      //initialize App
      this._initializeApp()
      
    }
  
    protected async _start(): Promise<void> {
      console.log("dts come to _start");

      this.state.server = this.state.app.listen(
        this.options.serverPort,
        this.options.serverHost
      )

      this.logger.info('Server started and listening', {
        port: this.options.serverPort,
        host: this.options.serverHost
      })

    }
    
    protected async _stop(): Promise<void> {

      console.log("dts come to _stop");

    }

    /**
     * Initializes the server application.
     * Do any sort of initialization here that you want. Mostly just important that
     * `_registerAllRoutes` is called at the end.
     */
     private _initializeApp() {
      // TODO: Maybe pass this in as a parameter instead of creating it here?
      this.state.app = express()
      this.state.app.use(cors())
      this.state.app.use(json())
      this._registerAllRoutes()
    }


  /**
   * Registers a route on the server.
   * @param method Http method type.
   * @param route Route to register.
   * @param handler Handler called and is expected to return a JSON response.
   */
  private _registerRoute(
      method: string, // Just handle GET for now, but could extend this with whatever.
      route: string,
      handler: (req?: Request, res?: Response) => Promise<any>
    ): void {
     
      this.state.app[method](route, async (req, res) => {
        const start = Date.now()
        try {

          const json = await handler(req, res)
          const elapsed = Date.now() - start

          this.logger.info('Served HTTP Request', {
            method: req.method,
            url: req.url,
            elapsed,
          })

          return res.json(json)
        } catch (e) {
          const elapsed = Date.now() - start
          this.logger.info('Failed HTTP Request', {
            method: req.method,
            url: req.url,
            elapsed,
            msg: e.toString(),
          })
          return res.status(400).json({
            error: e.toString(),
          })
        }
      })
  }

  /**
   * Registers all of the server routes we want to expose.
   * TODO: Link to our API spec.
   */
  private _registerAllRoutes(): void {
    // TODO: Maybe add doc-like comments to each of these routes?

    this._registerRoute(
      'get',
      '/cross/fees',
      async (): Promise<APIData> => {
      
        let feeModel = new FeeModel(this.state.db);
        let dbRet = await feeModel.getFeeList();

        return okResphonse(dbRet);

      }
    ),

    this._registerRoute(
      'get',
      '/cross/fee/:fromChainID/:toChainID/:txSize',
      async (req): Promise<APIData> => {

        console.log("come to request ....");

        //validate
        //txSize
        let paramsTxSize = req.params.txSize;
        let isNumber = validators.isNumericStr(paramsTxSize);
        if(!isNumber){
          return errResphonse(ERR_MSG.TXSIZE_NEED_NUMBER.NO,ERR_MSG.TXSIZE_NEED_NUMBER.MSG);
        }
        let txSize = BigNumber.from(paramsTxSize).toNumber()
        if(txSize == 0){
          return errResphonse(ERR_MSG.TXSIZE_NEED_NUMBER.NO,ERR_MSG.TXSIZE_NEED_NUMBER.MSG);
        }else if(txSize > 100){
          return errResphonse(ERR_MSG.TXSIZE_OVER_LIMIT.NO,ERR_MSG.TXSIZE_OVER_LIMIT.MSG);
        }

        let feeModel = new FeeModel(this.state.db);
        let dbRet = await feeModel.getSelFee(req.params.fromChainID,req.params.toChainID,txSize);

        if(dbRet.length == 0){
          return errResphonse(ERR_MSG.FROM_OR_TO_CHAIN.NO,ERR_MSG.FROM_OR_TO_CHAIN.MSG);
        }

        return okResphonse(dbRet);

      }

    ),

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/getParamsByCrossID',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl getParamsByCrossID params : ",params);

        let nftModel = new NFTModel(this.state.db);
        let list = await nftModel.getParamsByCrossID(
            "0x" + params.crossID,
        );
        let ret = { 
          ids:[], uris:[],tos:[]
        }

        console.log("xxl getDataByCrossID ",list);
        if(list == null){
          console.log("xxl not exist ");
          return okResphonse([]);
        }

        for(var i = 0 ;i < list.length ;i ++){

          var uri = list[i]["uri"] 
          if(uri == "" ){
            uri = "http://test/" + list[i]["nftID"]
          }

          ret["ids"].push(list[i]["nftID"]);
          ret["uris"].push(uri);
          ret["tos"].push(list[i]["toAddress"]);
        
        }

        
        if(list.length > 0){
          ret["tos"].push(getTokenFromChainID(this.options.chainToken,list[0]["toChainID"]));
        }

        return okResphonse(ret);
        // return okResphonse("OK");

    }),

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/registerCrossNFTTxs',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl10 ",params);
        
        //check crossid 
        let crossID = getCrossID(params);
        console.log("###xxl11 cross/registerCrossNFTTx",crossID);
        if(crossID != params["crossID"]){
          return errResphonse(ERR_MSG.NO_CROSSID_ERROR.NO,ERR_MSG.NO_CROSSID_ERROR.MSG);
        }

        //check sign
        const signingAddress = this.state.web3.eth.accounts.recover(params["signObj"].message, params["signObj"].signature);
        if(signingAddress != params["fromAddress"]){
          return errResphonse(ERR_MSG.SIGN_NOT_OK.NO,ERR_MSG.SIGN_NOT_OK.MSG);
        }

        try{
          let nftModel = new NFTModel(this.state.db);
          let isSucess = await nftModel.regsterCrossNFTTxs(params);

          if(isSucess){
            return okResphonse(crossID);
          }else{
            return errResphonse(ERR_MSG.DB_INSERT_ERROR.NO,ERR_MSG.DB_INSERT_ERROR.MSG);
          }
        }catch(e){
          return errResphonse(ERR_MSG.UNKOWN_ERROR.NO,ERR_MSG.UNKOWN_ERROR.MSG);
        }
    })

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/addDepositRecord',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###setDepositRecord 0 ",params);
        
        try{
          let nftModel = new NFTModel(this.state.db);

          // let tokenAddress = getTokenFromChainID(this.options.chainToken,params["fromChainID"]);
          // let tokenWallet = getWalletFromChainID(this.state,this.options.chainToken,params["fromChainID"]);

          // console.log("###setDepositRecord 1 aaa",tokenAddress,tokenWallet.address);
          
          // let len = params["nftID"].length;
          // for(var i = 0 ; i < len ;i ++){

          //   let uri = await evmHandles.getEvmNFT(tokenAddress,tokenWallet,params["nftID"][i]);
          //   params["uri"] = uri;
          // }
          
          // console.log("###setDepositRecord 2 ",params);
          let isSucess = await nftModel.addDepositRecord(params);

          if(isSucess){
            return okResphonse(params.crossID);
          }else{
            return errResphonse(ERR_MSG.DB_INSERT_ERROR.NO,ERR_MSG.DB_INSERT_ERROR.MSG);
          }
        }catch(e){
          return errResphonse(ERR_MSG.UNKOWN_ERROR.NO,ERR_MSG.UNKOWN_ERROR.MSG);
        }
    })


    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/setStatus',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###setDepositRecord ",params);
        console.log("###setDepositRecord ",params["crossID"]);
        
        try{
          let nftModel = new NFTModel(this.state.db);
          let isSucess = await nftModel.setStatus(params);

          if(isSucess){
            return okResphonse(params.crossID);
          }else{
            return errResphonse(ERR_MSG.DB_INSERT_ERROR.NO,ERR_MSG.DB_INSERT_ERROR.MSG);
          }
        }catch(e){
          return errResphonse(ERR_MSG.UNKOWN_ERROR.NO,ERR_MSG.UNKOWN_ERROR.MSG);
        }
    })  

  
  }
  
}

