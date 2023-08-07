export const CROSS_TYPE = {
    NO_CROSS: -1,
    IRIS2PLG: 0,
    PLG2IRIS: 1
}

export const ERR_MSG = {
    TXSIZE_OVER_LIMIT:{
        NO:-1001,
        MSG:"tx size more than 100 error"
    },
    TXSIZE_NEED_NUMBER:{
        NO:-1002,
        MSG:"tx size type or equal 0 error"
    },
    FROM_OR_TO_CHAIN:{
        NO:-1003,
        MSG:"from chain or to chain do not match fee error"
    },
    SIGN_NOT_OK:{
        NO:-1004,
        MSG:"the signature is not correct"
    },
    CROSS_NOT_MATCH:{
        NO:-1005,
        MSG:"the cross chainID is not correct"
    },
    NFT_NOT_EXIST:{
        NO:-1006,
        MSG:"src nft is not exist"
    },
    ISIR_TRANSFER_ERROR:{
        NO:-1007,
        MSG:"iris transfer error"
    },
    UNSIGN_TX_NOT_MATCH:{
        NO:-1008,
        MSG:"the unsign tx is not match"
    },

    FEE_TOO_SMALL:{
        NO:-1009,
        MSG:"current fee is to small"
    },

    EVM_BROADCAST_ERROR:{
        NO:-1010,
        MSG:"evm send Signed Transaction error"
    },

    IRIS_BROADCAST_ERROR:{
        NO:-1011,
        MSG:"iris send Signed Transaction error"
    },

    CROSS_EVM_ERROR:{
        NO:-1012,
        MSG:"crosss to evm error"
    },

    CROSS_IRIS_ERROR:{
        NO:-1013,
        MSG:"crosss to iris error"
    },

    NO_DATA_ERROR:{
        NO:-1014,
        MSG:"no data to deal with"
    },

    NO_DEAL_ERROR:{
        NO:-1015,
        MSG:"continue or back process error"
    },

    NO_CROSSID_ERROR:{
        NO:-1016,
        MSG:"crossID error"
    },

    DB_INSERT_ERROR:{
        NO:-1017,
        MSG:"DB insert error"
    },

    UNKOWN_ERROR:{
        NO:-1100,
        MSG:"unknown error"
    },

    NO_TX_TO_DEAL_WITH:{
        NO:0,
        MSG:"no tx to deal with"
    },


    
}

export const CHAIN_IDS = {
    IRIS_TETNET:  "nyancat-9",
    IRIS_MAINNET: "irishub-1",
    PLG_TETNET:  80001,
    PLG_MAINNET: 137,
}

export const IRIS_PARAMS = {
    TIMEOUT:10000,
}

export const CROSS_STATUS = {

    START_DATA:             0,
    PACK_OK:                1,
    
    FROM_CHAIN_PENNDING:    2,
    FROM_CHAIN_OK:          3,

    CHAIN_CROSSING:         4,
   
    TO_CHAIN_PENNDING:      5,
    TO_CHAIN_OK:            6,
   
    FROM_CHAIN_ERROR:       7,
    TO_CHAIN_ERROR:         8,
    
    POST_SERVER_OK:         9
    
}