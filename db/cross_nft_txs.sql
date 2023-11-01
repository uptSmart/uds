SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for txs
-- ----------------------------
DROP TABLE IF EXISTS `cross_nft_txs`;
CREATE TABLE `cross_nft_txs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `crossID` varchar(128) DEFAULT NULL COMMENT 'cross ID',
  `type` int(4) DEFAULT 0 COMMENT 'type',
  `nftID` varchar(256) DEFAULT NULL COMMENT 'NFT uri',
  `amount` varchar(256) DEFAULT NULL COMMENT 'NFT uri',
  `uri` varchar(256) DEFAULT NULL COMMENT 'NFT uri',
  `fromAddress` varchar(64) DEFAULT NULL COMMENT 'from address',
  `fromChainID` varchar(64) DEFAULT NULL COMMENT 'from chain ID',
  `toAddress` varchar(64) DEFAULT NULL COMMENT 'to address',
  `toChainID` varchar(64) DEFAULT NULL COMMENT 'to chain ID',
  `signature` varchar(256) DEFAULT NULL COMMENT 'signature',
  `timespan` varchar(32) DEFAULT NULL COMMENT 'timespan',
  `fee` varchar(32) DEFAULT NULL COMMENT 'cost fee',
  `depositTx` varchar(256) DEFAULT  NULL COMMENT 'deposit tx from src chain',
  `voteTx`    varchar(256) DEFAULT  NULL COMMENT 'vote tx from src chain',
  `executeTx` varchar(256) DEFAULT  NULL COMMENT 'execute tx from dst chain',
  `status` int(4) DEFAULT 0 COMMENT 'status',
  `errCode` int(4) DEFAULT 0 COMMENT 'error code',
  `errMsg` varchar(256) DEFAULT NULL COMMENT 'error message',
  `actionType` int(4) DEFAULT 0  NULL COMMENT 'action Type 0:normal 1:back 2:retry',
  `resourceID` varchar(128) DEFAULT NULL COMMENT 'resourceID for cross chain',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;