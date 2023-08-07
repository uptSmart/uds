import {
    isNull,
} from '../utils'


export class FeeModel {

    private _db: any;

    public constructor(db:any) {

        this._db = db;
    }


    public  async getFeeList() {


        try {
            let querySQL = "select a.fromChainID,a.toChainID,b.txSize,b.cost,b.iris as iris,b.bsc as bsc \
                            from fee a ,fee_phase b \
                            where a.id = b.feeID \
                            order by b.feeID"            
            let dbRet = await this._db.query(querySQL,[]);
            return dbRet;
            
        }catch (e) {
            console.log(e);
        }

    }


    public  async getSelFee(fromChainID:string,toChainID:string,txSzie:number) {


        try {
            let querySQL = "select a.fromChainID,a.toChainID,b.txSize,b.cost,b.iris as iris,b.bsc as bsc \
                            from fee a ,fee_phase b \
                            where a.id = b.feeID \
                            and a.fromChainID = ?\
                            and a.toCHainID = ?\
                            and b.txSize >= ?\
                            order by b.feeID,b.txSize asc"            
            let dbRet = await this._db.query(querySQL,[fromChainID,toChainID,txSzie]);
            if(dbRet.length > 0){
                return dbRet[0];
            }else{
                return dbRet;
            }

            
            
        }catch (e) {
            console.log(e);
        }

    }


    public  async setSingleFee(irisFee:number,irisGas:number,bnbFee:number,bnbGas:number,) {

        try {
            let rateRec = await this.getFeeRate(1);
            
            if(isNull(rateRec)){
                console.log("can not get fee rate data");
            }
    
            let realIris = irisFee /1000000 * irisGas
            let realBnb =  bnbFee / 100000000 * bnbGas

            //iris to Plg
            let iris2PlgFee = (realIris + realBnb) * rateRec[0].rate
            let irisRealFee = iris2PlgFee / irisFee * 1000000
            let PlgRealFee = iris2PlgFee / bnbFee * 100000000000000000


            console.log("setSingleFee data");
            console.log(irisFee);

            console.log("setSingleFee 0000");
            console.log(iris2PlgFee);
            console.log(irisRealFee);
            console.log(PlgRealFee);

            await this.writeFee(irisRealFee,PlgRealFee,iris2PlgFee,1,rateRec[0].txSize);

            //Plg to iris
            let Plg2irisFee = (realIris + realBnb)*rateRec[1].rate
            irisRealFee = Plg2irisFee / irisFee * 1000000
            PlgRealFee = Plg2irisFee / bnbFee * 100000000000000000
            await this.writeFee(irisRealFee,PlgRealFee,Plg2irisFee,2,rateRec[1].txSize);
        
        }catch (e) {
            console.log(e);
        }

    }

    public  async writeFee(iris:number,Plg:number,fee:number,feeID:number,txSize:number) {


        try {
            let querySQL = "update fee_phase set cost = ?,iris = ?,bsc = ?\
                            where feeID=? and txSize=?"
                            
            await this._db.query(querySQL,[fee,iris,Plg,feeID,txSize]);          
        }catch (e) {
            console.log(e);
        }


    }


    public  async getFeeRate(txSzie:number) {

        try {
            let querySQL = "select a.rate as rate ,a.feeID as feeID,a.txSize as txSize \
                            from fee_phase a \
                            where a.txSize = ? \
                            order by a.feeID asc "            
            let dbRet = await this._db.query(querySQL,[txSzie]);
            if(dbRet.length > 0){
                return dbRet;
            }else{
                return null;
            }
                        
        }catch (e) {
            console.log(e);
            return null;
        }


    }




}