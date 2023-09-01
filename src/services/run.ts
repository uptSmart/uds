/* Imports: External */
import * as dotenv from 'dotenv'
import Config from 'bcfg'

/* Imports: Internal */
import { DataTransportService } from './main/service'

interface Bcfg {
    load: (options: { env?: boolean; argv?: boolean }) => void
    str: (name: string, defaultValue?: string) => string
    uint: (name: string, defaultValue?: number) => number
    bool: (name: string, defaultValue?: boolean) => boolean
}

;(async () => {
    
    dotenv.config()

    const config: Bcfg = new Config('uptick-data-service')
    config.load({
        env: true,
        argv: true,
      })

    const service = new DataTransportService({

        dbConf:{
            host:       config.str('dbHost', ''),
            user:       config.str('dbUser', ''),
            password:   config.str('dbPassword', ''),
            name:       config.str('dbName', ''),
            port:       config.uint('dbPort',3306),
        },

        serverHost :  config.str('serverHost', ""),
        serverPort :  config.uint('serverPort', 8789),

        chainToken:{

            uptickToken:      config.str('uptickToken', ''),
            uptickChainId:    config.str('uptickChainId', ''),
            uptickRPC:        config.str('uptickRpc', ''),
            uptickAdmin:      config.str('uptickPriv', ''),

            polygonToken:     config.str('polygonToken', ''),
            polygonChainId:   config.str('polygonChainId', ''),
            polygonRPC:       config.str('polygonRpc', ''),
            polygonAdmin:     config.str('polygonPriv', ''),

            bscToken:         config.str('bscToken', ''),
            bscChainId:       config.str('bscChainId', ''),
            bscRPC:           config.str('bscRpc', ''),
            bscAdmin:         config.str('bscPriv', ''),
            
            arbitrumToken:    config.str('arbitrumToken', ''),
            arbitrumChainId:  config.str('arbitrumChainId', ''),
            arbitrumRPC:      config.str('arbitrumRpc', ''),
            arbitrumAdmin:    config.str('arbitrumPriv', ''),
            
            ethToken:         config.str('ethToken', ''),
            ethChainId:       config.str('ethChainId', ''),
            ethRPC:           config.str('ethRpc', ''),
            ethAdmin:         config.str('ethPriv', '')

        },


    
    });

    await service.start()


})()


// UPTICK_DATA_SERVICE__UPTICK_TOKEN="0x7CfA9E70666733942906f77a64826Def2f7FE432"
// UPTICK_DATA_SERVICE__POLYGON_TOKEN="0x8391a1D5FD49aB57f2728a2e38fCCB6bC0B2FCCa"