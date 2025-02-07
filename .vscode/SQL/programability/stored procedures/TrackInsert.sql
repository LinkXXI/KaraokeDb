DROP PROCEDURE IF EXISTS TrackInsert;
CREATE PROCEDURE `TrackInsert`(
    TrackArtist VARCHAR(255),
    TrackName VARCHAR(255),
    KaraokeTrackId VARCHAR(255),
    FilePath VARCHAR(255),
    FileSize INT,
    FileHash VARCHAR(255)
)
    MODIFIES SQL DATA
BEGIN

    SET @existing = 0;
    SELECT COUNT(*)AS e INTO @existing FROM `KaraokeTracks` KT
    WHERE
        KT.`TrackArtist` = `TrackArtist`
        AND KT.`TrackName` = `TrackName`
        AND KT.`KaraokeTrackId` = `KaraokeTrackId`
        AND KT.`LibraryPath` = `LibraryPath`
        AND KT.`FileSize` = `FileSize`
        AND KT.`FileHash` = `FileHash`;
    IF @existing = 0 THEN
        INSERT INTO KaraokeTracks (InsertDateTime, TrackArtist, TrackName, KaraokeTrackId, LibraryPath, FileSize, FileHash, KaraokeBrand)
        VALUES(NOW(), TrackArtist, TrackName, KaraokeTrackId, LibraryPathExtract(FilePath), FileSize, FileHash, AlphaExtract(KaraokeTrackId));
    END IF;
END