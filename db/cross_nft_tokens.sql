SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cross_nft_tokens
-- ----------------------------
DROP TABLE IF EXISTS `cross_nft_tokens`;
CREATE TABLE `cross_nft_tokens` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `resourceID` varchar(128) DEFAULT NULL COMMENT 'resourceID for cross chain',
  `fromChainID` varchar(64) DEFAULT NULL COMMENT 'from chain ID',
  `fromTokenAddress` varchar(64) DEFAULT NULL COMMENT 'from token address',
  `toChainID` varchar(64) DEFAULT NULL COMMENT 'to chain ID',
  `toTokenAddress` varchar(64) DEFAULT NULL COMMENT 'to token address',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;