import mysql, { Pool } from "mysql";

export default class MySQL {

    private static _pool:Pool;
    private static _cnn: mysql.Connection;
    private constructor() {}

    public static createPool(host:string,
                            user:string,
                            password:string,
                            database:string,
                            port:number){

        this._pool =  mysql.createPool({
                host     :  host,
                user     :  user,
                password :  password,
                database :  database,
                port     :  port
        })

     }

     public static getConnection(){

        return new Promise(( resolve, reject ) => {
            
            this._pool.getConnection(function(err, connection) {

                if(connection._pool._freeConnections.indexOf(connection) == -1){
                    connection.release();
                }

                if (err) {
                    connection.release();
                    reject( err )
                } else {
                    MySQL._cnn = connection;
                    return resolve(connection);
                };

            });
        });
    }



    public static query(sql, values){

        return new Promise(( resolve, reject ) => {

            this._cnn.query(sql, values, ( err, rows) => {
                if ( err ) {
                    console.log("error");
                    reject( err )
                } else {
                    return resolve( rows )
                }
            })

        })

    }


    public static releaseConnection(){

        return new Promise(( resolve, reject ) => {
        
            this._cnn.release();
            resolve(this._cnn);
        
        })
    }



}