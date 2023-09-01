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
  toHexStringL,
  outputLog
} from '../../utils'
import { BigNumber,Wallet,utils } from 'ethers'
import { JsonRpcProvider, UrlJsonRpcProvider } from '@ethersproject/providers'
import { handles as evmHandles  } from '../evm/handles';


import { sleep, toHexString } from '@eth-optimism/core-utils';

import schedule from "node-schedule";


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
  uptickAdmin:         string

  polygonToken:        string
  polygonChainId:      string
  polygonRPC:          string
  polygonAdmin:        string

  bscToken:            string
  bscChainId:          string
  bscRPC:              string
  bscAdmin:            string

  arbitrumToken:       string
  arbitrumChainId:     string
  arbitrumRPC:         string
  arbitrumAdmin:       string
  
  ethToken:            string
  ethChainId:          string
  ethRPC:              string
  ethAdmin:            string
}


export interface DataTransportServiceOptions {
    
    //DB
    dbConf:       DBConf

    //host
    serverHost:   string
    serverPort:   number

    chainToken:ChainToken

}


export class DataTransportService extends BaseService<DataTransportServiceOptions> {
    
    protected name = 'Uptick Data Service'
    protected cross_id_random_length = 3
    protected scheduleJob:any;

    private curMintList = new Map()
  
    private state: {
        db:any,
        app: express.Express,
        server: any,

        web3:any,
        web3Uptick:any,
        web3Polygon:any,
        web3Bsc:any,
        web3Eth:any,
        web3Arbitrum:any,

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
      this.state.web3Uptick = new Web3(this.options.chainToken.uptickRPC);
      this.state.web3Polygon = new Web3(this.options.chainToken.polygonRPC);
      this.state.web3Bsc = new Web3(this.options.chainToken.bscRPC);
      this.state.web3Eth = new Web3(this.options.chainToken.ethRPC);
      this.state.web3Arbitrum = new Web3(this.options.chainToken.arbitrumRPC);

      //2.add wallet
      this.state.uptickWallet = setWallet(this.options.chainToken.uptickRPC,this.options.chainToken.uptickAdmin);
      this.state.polygonWallet = setWallet(this.options.chainToken.polygonRPC,this.options.chainToken.polygonAdmin);
      this.state.bscWallet = setWallet(this.options.chainToken.bscRPC,this.options.chainToken.bscAdmin);
      this.state.ethWallet = setWallet(this.options.chainToken.ethRPC,this.options.chainToken.ethAdmin);
      this.state.arbitrumWallet = setWallet(this.options.chainToken.arbitrumRPC,this.options.chainToken.arbitrumAdmin);
      
      let rule = new schedule.RecurrenceRule();
      let times = [];

      for(var i=1; i<60; i++){
        if(i%5 == 0){
          times.push(i);
        }
      }
      rule.second = times;

      this.scheduleJob = schedule.scheduleJob(rule, function(){
        this._processBatch();
      }.bind(this));

      //initialize App
      this._initializeApp()
      
    }

    private async _processBatch(): Promise<APIData> {


      let nftModel = new NFTModel(this.state.db);

      //2.get pending tx from bridge nft xxl TODO Multiple OK
      let dbRet = await nftModel.getBatchProcessTx();
      //3.pending nft is exist
      let ret = isNull(dbRet);
      if(ret){
        outputLog(ERR_MSG.NO_TX_TO_DEAL_WITH.NO,ERR_MSG.NO_TX_TO_DEAL_WITH.MSG);
        return;
      }

      for(var i = 0 ;i < dbRet.length; i++){
        //4.procee each rec
        await this._processEachRec(dbRet[i],nftModel)
      }
  
    
    }



    private async _processEachRec(eachRec:any,nftModel:any){


      //run bridge burn 

      //webObj
      let { web3Obj } = this.getChainObjFromChainID(eachRec.toChainID)
      let rep = await web3Obj.eth.getTransactionReceipt(eachRec.executeTx)
      
      if(rep["status"]){
        //update the status
        await nftModel.setStatusByCrossID(eachRec.crossID,3);
      }else{
       
        if(!this.curMintList.has(eachRec["nftID"])){
            // await sleep(2000)
            let {wallet,tokenContractAddress} = this.getChainObjFromChainID(eachRec.fromChainID)
            this.curMintList.set(eachRec["nftID"],true);
            //mint the data
            console.log("xxl need to mint",eachRec["fromChainID"],eachRec["nftID"])
            let reuslt = await evmHandles.mintNFT(
              tokenContractAddress,
              wallet,
              eachRec
            );

            console.log("#### xxl mintNFT ---- ",reuslt)
            if(reuslt){
              this.curMintList.delete(eachRec["nftID"]);
              console.log("mint NFT result is : ",reuslt);
              await nftModel.setStatusByCrossID(eachRec.crossID,4);
            }else{
              this.curMintList.set(eachRec["nftID"],false);
              console.log("xxl this.curMintList :",this.curMintList);
              await nftModel.setStatusByCrossID(eachRec.crossID,-2);
            }
        }
      }

    }



    //stpe 2
    protected getChainObjFromChainID(chainID){

      let web3Obj,wallet,tokenContractAddress;
      if(chainID == 1170 || chainID == 117){  

        web3Obj = this.state.web3Uptick;
        wallet = this.state.uptickWallet;
        tokenContractAddress = this.options.chainToken.uptickToken;
       
      }else if(chainID == 80001 || chainID == 137 ){

        web3Obj = this.state.web3Polygon;
        wallet = this.state.polygonWallet;
        tokenContractAddress = this.options.chainToken.polygonToken;
        
      }else if(chainID == 97 || chainID == 56 ){

          web3Obj = this.state.web3Bsc;
          wallet = this.state.bscWallet;
          tokenContractAddress = this.options.chainToken.bscToken;
      
      }else if(chainID == 421613 || chainID == 42161  ){

          web3Obj = this.state.web3Arbitrum;
          wallet = this.state.arbitrumWallet;
          tokenContractAddress = this.options.chainToken.arbitrumToken;
      
      }else if(chainID == 11155111 || chainID == 1 ){

          web3Obj = this.state.web3Eth;
          wallet = this.state.ethWallet;
          tokenContractAddress = this.options.chainToken.ethToken;
      }

      return {web3Obj,wallet,tokenContractAddress};
    
    }


    protected async  getAddressFromChainId(chainID,tx){

      let {web3Obj} = this.getChainObjFromChainID(chainID);
      let txObj = await  web3Obj.eth.getTransaction(tx);
      return txObj["from"]
  
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

        console.log("xxl getDataByCrossID 0 ");
        console.log("xxl getDataByCrossID 1 ",this.options.chainToken);
        console.log("xxl getDataByCrossID 2 ",list);
        if(list == null){
          console.log("xxl not exist ");
          return okResphonse([]);
        }

        console.log("xxl getDataByCrossID 1");
        for(var i = 0 ;i < list.length ;i ++){

          var uri = list[i]["uri"] 
          if(uri == "" ){
            uri = "http://test/" + list[i]["nftID"]
          }

          ret["ids"].push(list[i]["nftID"]);
          ret["uris"].push(uri);
          ret["tos"].push(list[i]["toAddress"]);
        
        }
        console.log("xxl getDataByCrossID 2");

        if(list.length > 0){
          console.log("xxl getDataByCrossID 3");

          //TODO
          let tokenAddress = await nftModel.getTokenAddressFromResourceIDAndChainID(list[0]["resourceID"],list[0]["toChainID"])
          ret["tos"].push(tokenAddress);
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
    }),

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/addDepositRecord',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###setDepositRecord 0 ",params);
        
        try{
          let nftModel = new NFTModel(this.state.db);


          params["fromAddress"] = await this.getAddressFromChainId(params['fromChainID'],params["depositTx"]);
          console.log("###setDepositRecord 1 ",params);

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
    }),


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
    }),
    
    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/getDataByCrossID',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl 001 getDataByCrossID params : ",params);

        let nftModel = new NFTModel(this.state.db);
        let list = await nftModel.getDataByCrossID(
            params.crossID,
        );

        return okResphonse(list);
        // return okResphonse("OK");

    }),

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/getDataByFromAddress',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl getDataByFromAddress params : ",params);

        let nftModel = new NFTModel(this.state.db);
        let list = await nftModel.getDataByFromAddress(
            params.fromAddress,
        );

        return okResphonse(list);
        // return okResphonse("OK");

    }),
    
    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/getDataByToAddress',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl getDataByToAddress params : ",params);

        let nftModel = new NFTModel(this.state.db);
        let list = await nftModel.getDataByToAddress(
            params.toAddress,
        );

        return okResphonse(list);
        // return okResphonse("OK");

    }),

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/getDataByAddress',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl getDataByAddress params : ",params);

        let nftModel = new NFTModel(this.state.db);
        let list = await nftModel.getDataByAddress(
            params.address,
        );

        return okResphonse(list);
        // return okResphonse("OK");

    }),

    //call from chainbridge
    this._registerRoute(
      'post',
      '/cross/getDataByNftID',
      async (req): Promise<APIData> => {

        const params = req.body

        console.log("###xxl getDataByNftID params : ",params);

        let nftModel = new NFTModel(this.state.db);
        let list = await nftModel.getDataByNftID(
            params.nftID,
        );

        return okResphonse(list);
        // return okResphonse("OK");

    })


  }


  
  
}


