import {
    CROSS_STATUS,
    NFTIDIris2Evm
  } from '../utils'


export class NFTModel {

    private _db: any;

    public constructor(db:any) {
        this._db = db;
    }

    public  async updateStatus(crossId,status) {

        try {

            //xxl TODO need to add transaction
            let bridgeSQL = "update bridge_nft set status = ? \
                            where crossID = ? "
            await this._db.query(bridgeSQL,[status,crossId]);
         
            
        }catch (e) {
            console.log(e);
        }

    }

    public async getBridgebyCrossID(crossID:string) {

        try {
            let querySQL = "select * from bridge_nft  \
                            where crossID = ? "            
            let dbRet = await this._db.query(querySQL,[crossID]);

            if(dbRet.length > 0){
                return dbRet[0]
            }else{
                return dbRet;
            }
        }catch (e) {
            console.log(e);
        }

    }


    public  async updateTxHashAndStatus(chainName:string,txHash:string,crossID:string,status:number) {

        try {
            
             //xxl TODO transaction
            let tableName = chainName + "_nft"
            let txHashSQL = "update " + tableName + " set txHash = ? where crossID = ? "
            await this._db.query(txHashSQL,[txHash,crossID]);

            let bridgeSQL = "update bridge_nft set status = ? where crossID = ? "
            await this._db.query(bridgeSQL,[status,crossID]);  
                
        }catch (e) {
            console.log(e);
        }

    }



    public async writeEvmRec(chainName,evmRec:any) {

        try {
            let tableName = chainName + "_nft"
            let querySQL = "insert into " + tableName + "(globalID,nftID,name,symbol,baseURI,crossID) \
                            values(?,?,?,?,?,?) "            
            await this._db.query(querySQL,evmRec);


        }catch (e) {
            console.log(e);
        }

    }

    public async updateEVMRecords(crossID:string,txHash:string,chainName:string) {

        try {

            let tableName = chainName  + "_nft"
           
            let updateSQL = "update " + tableName + " set txHash = ? where crossID = ?"            
            let resulut = await this._db.query(updateSQL,[txHash,crossID]);

            console.log("xxl updateEVMRecords start ");
            console.log(updateSQL);
            console.log([txHash,crossID]);
            console.log(resulut);
            console.log("xxl updateEVMRecords end ");

            return resulut;
          

        }catch (e) {
            console.log(e);
            return "";
        }

    }


    public async updatePlgRec(toAddress:string,nftID:string,txHash:string,chainName:string) {

        try {

            let tableName = chainName  + "_nft"
            let querySQL = ""
            if(chainName == "upt"){
                querySQL = "select a.crossID from bridge_nft a," + tableName + " b " + 
                "where lower(a.toAddress) <> ?  and b.nftID = ? and status >= ? and status <= ? and a.id = b.id order by b.id desc" 
            }else{
                querySQL = "select crossID from v_plg_iris " + 
                "where lower(toAddress) = ?  and plgNFTID = ? and status >= ? and status < ? order by id desc" 
            }
            
            // console.log("xxl updatePlgRec ...");              
            // console.log(querySQL);
            // console.log([
            //     toAddress,
            //     nftID,
            //     CROSS_STATUS.FROM_CHAIN_PENNDING,
            //     CROSS_STATUS.POST_SERVER_OK
            // ]);
            let dbRet = await this._db.query(querySQL,
                                            [
                                                toAddress.toLowerCase(),
                                                nftID,
                                                CROSS_STATUS.FROM_CHAIN_PENNDING,
                                                CROSS_STATUS.POST_SERVER_OK
                                            ]);

            // console.log(dbRet);                                
            if(dbRet.length > 0){

                let updateSQL = "update " + tableName + " set txHash = ? where crossID = ?"            
                await this._db.query(updateSQL,[txHash,dbRet[0].crossID]);

                return dbRet[0].crossID
            }else{
                return "";
            }

        }catch (e) {
            console.log(e);
            return "";
        }

    }



    public async getDataFromCrossId(crossID:string){

        try {
            let querySQL = "select a.fromAddress,a.toAddress,a.fromChainID,a.toChainID,a.fee,a.status,a.errCode,a.errMsg,UNIX_TIMESTAMP(a.createdAt) as createdTime , \
                            c.denomID  irisDenomID,c.nftID irisTokenID,c.txHash irisTxHash,\
                            b.nftID plgTokenID,b.tokenAddress plgNFTAddress,b.txHash plgTxHash\
                            from bridge_nft a,plg_nft b,iris_nft c \
                            where a.crossID = b.crossID and b.crossID=c.crossID and a.crossID=? \
                            and b.globalID = a.globalID and b.globalID = c.globalID"

            //console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[crossID]);

            //console.log(dbRet);
            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }
    }

    public async getHistoryDataFromCrossId(crossID:string){

        try {
         

            let querySQL = "select fromAddress,fromChainID,toAddress,toChainID,status,actionType, \
                            UNIX_TIMESTAMP(createdAt) as createdAt,errCode,errMsg \
                            from bridge_nft_history \
                            where crossID = ? order by createdAt desc,id desc"

            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[crossID]);

            console.log(dbRet);
            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return this.uniqueByStatus(dbRet);
            }

        }catch (e) {
            console.log(e);
            return null;
        }
    }

    public uniqueByStatus(dbRet) :any{

        let rec = [];
        let isFind = false;
        for(let i = 0 ; i < dbRet.length ;i ++){

            for(let j = 0 ; j < rec.length ;j ++){
                console.log("uniqueByStatus" + rec[j].status);
                console.log("uniqueByStatus" + dbRet[i].status);

                if(rec[j].status == dbRet[i].status){
                    isFind = true;
                }
            }
            if(!isFind){
                rec.push(dbRet[i]);
            }
            isFind = false;
        }

        return rec;

    }

    public async getDataFromTokenId(
        chainID :string,
        denomID:string,
        dstBridge:string,
        NFTID:string,
        page:number,
        size:number,
        sort:string){

        try {
            let startNum = (page - 1) * size

            //
            let evmType = false;
            if(denomID.substr(0,2) == "0x" && NFTID.substr(0,2) == "0x"){
                evmType = true;
            }else{
                evmType = false;
            }

            if(evmType)
            {

                    let querySQL="select fromAddress,toAddress,fromChainID,toChainID,fee,irisDenomID,\
                    irisNFTID irisTokenID,plgNFTID plgTokenID,plgTxHash,irisTxHash,status,UNIX_TIMESTAMP(createdTime) as createdTime\
                    from v_plg_iris \
                    where (fromChainID = ? or toChainID = ? ) and plgNFTID = ?  and status = 9 \
                    order by v_plg_iris.id"+" "+sort+" "
                    "limit ?,?"
    
                    let dbRet = await this._db.query(querySQL,[chainID,chainID,NFTID,startNum,size]);                 
                    console.log(dbRet);
                        //if DB not exit calc by myself
                    for(var i = 0 ;i < dbRet.length;i ++ ){
                        dbRet[i].plgNFTAddress=dstBridge;
                    }
                    
                    console.log(dbRet);
                    if(dbRet.length == 0){
                        return null;
                    }else{
                        return dbRet;
                     }              
            }else{             
                  
                    let querySQL="select fromAddress,toAddress,fromChainID,toChainID,fee,irisDenomID,\
                    irisNFTID irisTokenID,plgNFTID plgTokenID,plgTxHash,irisTxHash,status,UNIX_TIMESTAMP(createdTime) as createdTime\
                    from v_plg_iris\
                    where (fromChainID = ? or toChainID = ? ) and irisNFTID= ? and status = 9 \
                    order by  v_plg_iris.id"+" "+sort+" "
                    " limit ?,?" 
                    console.log(querySQL);
                    let dbRet = await this._db.query(querySQL,[chainID,chainID,NFTID,startNum,size]);
                    for(var i = 0 ;i < dbRet.length;i ++ ){
                        dbRet[i].plgNFTAddress=dstBridge;
                    }
                   
                    console.log(dbRet);
                        //if DB not exit calc by myself
                    if(dbRet.length == 0){
                        return null;
                    }else{
                        return dbRet;
                    }               
                }
                        
        }catch (e) {
            console.log(e);
            return null;
        }
    }


    public async getDataFromaddress(address:string,page:number,size:number,sort:string,dstBridge:string){

        try {
            let startNum = (page - 1) * size
            let querySQL = "select crossID,fromAddress,toAddress,fromChainID,toChainID,fee,irisDenomID,tokenAddress as plgNFTAddress, \
                            irisNFTID irisTokenID,plgNFTID plgTokenID,plgTxHash,irisTxHash,status,errCode,errMsg,UNIX_TIMESTAMP(createdTime) as createdTime \
                            from v_plg_iris\
                            where (fromAddress = ? or toAddress = ?)\
                            order by  v_plg_iris.id " +  sort +  
                            " limit ?,? "  
            let dbRet = await this._db.query(querySQL,[address,address,startNum,size]);

            console.log("xxl getDataFromaddress");
            console.log(querySQL);
            console.log([address,address,startNum,size]);

            //if DB not exit calc by myself
            if(dbRet.length == 0){
                return [];
            }else{
                return dbRet;
            }
        }catch (e) {
            console.log(e);
            return [];
        }
    }



    //xxl add hisotry log
    public async  addBridgeHistory(insertData){

        try {

            //if DB exis return db globleID
            let querySQL = "insert into bridge_nft_history \
                            (globalID,uri,fromAddress,fromChainID,toAddress,toChainID,fee,orgin,crossId,status,errCode,errMsg) \
                            values(?,?,?,?,?,?,?,?,?,?,?,?)"
            
            await this._db.query(querySQL,insertData);
            
        }catch (e) {
            console.log(e);
        }
    }
    
    //xxl add hisotry log
    public async  getErrcodeFromCrossID(crossID){

        try {
            //if DB exis return db globleID
            let querySQL = "select * from bridge_nft_history where crossID = ? \
                            order by createdAt desc "
            console.log("xxl selAndaddBridgeHistory start ....");
            let ret = await this._db.query(querySQL,[crossID]);

            if(ret.length > 0){
                return ret[0]
            }else{
                return null
            }
            
        }catch (e) {
            console.log(e);
            return null
        }

    }

    //xxl add 
    public async  getBridgeDataFromCrossID(crossID){

        try {
            //if DB exis return db globleID
            let querySQL = "select * from v_plg_iris where crossID = ? \
                            order by createdTime desc "
            console.log("xxl getBridgeDataFromCrossID start ....");
            let ret = await this._db.query(querySQL,[crossID]);

            if(ret.length > 0){
                return ret[0]
            }else{
                return null
            }
            
        }catch (e) {
            console.log(e);
            return null
        }

    }
    
    public  async updateTxHash(chainName:string,txHash:string,crossID:string) {

        try {            
             //xxl TODO transaction
            let tableName = chainName + "_nft"
            let txHashSQL = "update " + tableName + " set txHash = ? where crossID = ? "
            await this._db.query(txHashSQL,[txHash,crossID]);
            
        }catch (e) {
            console.log(e);
        }

    }

    public async getParamsByCrossID(crossID:string){

        try {
         
            let querySQL = "select uri,nftID,toAddress,toChainID,resourceID from cross_nft_txs \
                            where crossID = ? order by id "

            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[crossID]);
            console.log(dbRet);

            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }
    }

    //xxl regster Cross NFT Txs
    public async  regsterCrossNFTTxs(registerCrossNFTTxsParam){

        try {
            console.log("###xxl 00 regsterCrossNFTTxs : ",registerCrossNFTTxsParam);
 
            let len = registerCrossNFTTxsParam["nftID"].length;
            let values = [];
            for(let i = 0 ;i < len ;i ++){

                let eachRow = [
                        registerCrossNFTTxsParam["crossID"],registerCrossNFTTxsParam["nftID"][i],registerCrossNFTTxsParam["uri"][i],
                        registerCrossNFTTxsParam["fromAddress"],registerCrossNFTTxsParam["fromChainID"],registerCrossNFTTxsParam["toAddress"][i],
                        registerCrossNFTTxsParam["toChainID"],registerCrossNFTTxsParam["timespan"].toString(),registerCrossNFTTxsParam["signObj"].signature,
                        registerCrossNFTTxsParam["fee"],registerCrossNFTTxsParam["origin"].toString()
                ]
                values.push(eachRow);

            }


            console.log("###xxl array : ",values);
            //if DB exis return db globleID
            let querySQL = "insert into cross_nft_txs \
                            (crossID,nftID,uri,fromAddress,fromChainID,toAddress,toChainID,timespan,signature,fee,origin) \
                            values ?;"            
            let rowNum = await this._db.query( querySQL,[values]);
            console.log("### rowNum ",rowNum);
            return true;            

        }catch (e) {
            console.log(e);
            return false;
        }
    }

    //xxl regster Cross NFT Txs
    public async addDepositRecord(despositParam){

        try {
            console.log("###xxl 00 addDepositRecord start : ",despositParam);
            
            if(await this.isCrossIDExis("0x" + despositParam["crossID"])){

                console.log("###xxl 00 addDepositRecord aleady exist ");
                return false;
            }
            console.log("###xxl 00 addDepositRecord not exis : ",despositParam);

            let len = despositParam["nftID"].length;
            let values = [];
            for(let i = 0 ;i < len ;i ++){

                //TDOD uri fromAddress,timespan call for the contract ...
                let eachRow = [
                    "0x" + despositParam["crossID"],despositParam["nftID"][i],despositParam["uri"][i],
                    despositParam["fromAddress"],despositParam["fromChainID"],despositParam["toAddress"][i],
                    despositParam["toChainID"],despositParam["timespan"],
                    despositParam["depositTx"],"","",
                    despositParam["signature"],despositParam["fee"],"0x" + despositParam["resourceID"]
                ]
                values.push(eachRow);

            }


            console.log("###xxl array : ",values);
            //if DB exis return db globleID
            let querySQL = "insert into cross_nft_txs \
                            (crossID,nftID,uri,fromAddress,fromChainID,toAddress,toChainID, \
                            timespan,depositTx,voteTx,executeTx,signature,fee,resourceID) \
                            values ?;"
            let rowNum = await this._db.query( querySQL,[values]);
            console.log("### rowNum ",rowNum);
            return true;   
            
            


        }catch (e) {
            console.log(e);
            return false;
        }
    }

    private async isCrossIDExis(crossID){

        let querySQL = "select count(*) as cnt from cross_nft_txs where crossID = ? ;"
        let result = await this._db.query(querySQL,["0x" + crossID]);
        // console.log("xxl setStatus is 00; ",result);  
        // console.log("xxl setStatus is 01; ",parseInt(result[0]["cnt"], 10));   
        if( parseInt(result[0]["cnt"], 10) > 0){
            console.log("result is 000:",result[0]["cnt"]);
            return true;
        }else{
            console.log("result is 001:",result[0]["cnt"]);
            return false;
        }
    }


    //xxl regster Cross NFT Txs
    public async setStatus(statusParam){

        try {
            console.log("###xxl 00 statusParam : ",statusParam);


            if(statusParam.status == 1){

                console.log("###xxl 01 vote : ",statusParam.status );
                let updateSQL = "update cross_nft_txs set status = ?,voteTx = ? where crossID = ? ;"
                let result = await this._db.query(updateSQL,[statusParam.status,statusParam.tx,"0x" + statusParam.crossID]);
                console.log("xxl setStatus is ; ",result);

            }else if(statusParam.status == 2){

                console.log("###xxl 02 executeTx : ",statusParam.status );
                let updateSQL = "update cross_nft_txs set status = ?,executeTx = ? where crossID = ? ;"
                await this._db.query(updateSQL,[statusParam.status,statusParam.tx,"0x" + statusParam.crossID]);

            }



        }catch (e) {
            console.log(e);
            return false;
        }
    }

    //xxl regster Cross NFT Txs
    public async setStatusByCrossID(crossID,status){

        try {
            console.log("###xxl 00 statusParam : ",crossID);

            let updateSQL = "update cross_nft_txs set status = ? where crossID = ? ;"
            await this._db.query(updateSQL,[status,crossID]);

        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public async getDataByCrossID(crossID:string){

        try {
         

            let querySQL = "select a.*,b.* from cross_nft_txs a ,cross_nft_tokens b\
                            where a.crossID = ? and a.resourceID = b.resourceID order by a.id desc "

            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[crossID]);
            console.log(dbRet);

            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }
    }


    public async getDataByFromAddress(fromAddress:string){

        try {
         

            let querySQL = "select * from cross_nft_txs \
                            where fromAddress = ? order by id desc "

            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[fromAddress]);
            console.log(dbRet);

            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }
    }


    public async getDataByToAddress(toAddress:string){

        try {
         

            let querySQL = "select * from cross_nft_txs \
                            where toAddress = ? order by id desc"

            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[toAddress]);
            console.log(dbRet);

            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }
    }

    public async getDataByAddress(address:String){

        try {
         

            let querySQL = "select a.*,b.fromTokenAddress,b.toTokenAddress from cross_nft_txs a ,cross_nft_tokens b \
                            where (toAddress = ? or fromAddress = ?) and a.resourceID = b.resourceID order by a.id desc"

            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[address,address]);
            console.log(dbRet);

            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }

    }


    public async getDataByNftIDAndTokenAddress(nftID:String,tokenAddress:string){

        try {
         
            let querySQL = "select a.*,b.* from cross_nft_txs a ,cross_nft_tokens b \
                            where nftID = ? and a.resourceID = b.resourceID and \
                            ( LOWER(b.fromTokenAddress) = LOWER(?) or LOWER(b.toTokenAddress) = LOWER(?) ) order by a.id desc"
            console.log(querySQL);
                         
            let dbRet = await this._db.query(querySQL,[nftID,tokenAddress,tokenAddress]);
            console.log("result data" ,dbRet);

            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }

    }

    public async getBatchProcessTx(){

        try {
         
            let querySQL = "select * from cross_nft_txs where status = 2"                      
            let dbRet = await this._db.query(querySQL,[]);
   
            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                return dbRet;
            }

        }catch (e) {
            console.log(e);
            return null;
        }

    }

    public async getTokenAddressFromResourceIDAndChainID(resourceID,chainID){

        try {
         
            let querySQL = "select * from cross_nft_tokens where resourceID = ?"                      
            let dbRet = await this._db.query(querySQL,[resourceID]);
   
            //if DB not exit 
            if(dbRet.length == 0){
                return null;
            }else{
                if(dbRet[0]["fromChainID"] == chainID){
                    return dbRet[0]["fromTokenAddress"] 
                }else if(dbRet[0]["toChainID"] == chainID){
                    return dbRet[0]["toTokenAddress"] 
                }else{
                    return ""
                }
            }

        }catch (e) {
            console.log(e);
            return null;
        }

    }
}