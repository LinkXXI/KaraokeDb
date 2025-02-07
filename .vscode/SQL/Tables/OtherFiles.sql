CREATE TABLE `OtherFiles` (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `InsertDateTime` datetime DEFAULT NULL COMMENT 'Create Time',
  `FilePath` varchar(255) DEFAULT NULL,
  `LibraryPath` varchar(255) DEFAULT NULL,
  `FileExtension` varchar(255) DEFAULT NULL,
  `CanPurge` bit(1) DEFAULT b'0',
  `FileFixed` bit(1) DEFAULT b'0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=1399 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci