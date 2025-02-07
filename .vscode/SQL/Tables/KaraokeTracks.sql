CREATE TABLE `KaraokeTracks` (
  `Id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `InsertDateTime` datetime DEFAULT NULL COMMENT 'Create Time',
  `TrackArtist` varchar(255) DEFAULT NULL,
  `TrackName` varchar(255) DEFAULT NULL,
  `KaraokeTrackId` varchar(255) DEFAULT NULL,
  `FilePath` varchar(255) DEFAULT NULL,
  `FileSize` int(11) DEFAULT NULL,
  `FileHash` varchar(255) DEFAULT NULL,
  `KaraokeBrand` varchar(20) DEFAULT NULL,
  `LibraryPath` varchar(255) DEFAULT NULL,
  `SearchString` varchar(255) GENERATED ALWAYS AS (concat(`TrackArtist`,' ',`TrackName`,' ',`KaraokeTrackId`)) STORED COMMENT 'Calculated column for searching in applications',
  `SearchStringAlt` varchar(255) GENERATED ALWAYS AS (concat(`TrackArtist`,' ',`TrackName`)) STORED COMMENT 'Calculated column for searching in applications. Only contains Artist and Track for public library searches.',
  PRIMARY KEY (`Id`),
  KEY `SeachIndex` (`TrackArtist`,`TrackName`),
  KEY `TrackArtist` (`TrackArtist`,`TrackName`,`KaraokeTrackId`),
  KEY `SearchString` (`SearchString`),
  KEY `SearchStringAlt` (`SearchStringAlt`)
) ENGINE=InnoDB AUTO_INCREMENT=445759 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci