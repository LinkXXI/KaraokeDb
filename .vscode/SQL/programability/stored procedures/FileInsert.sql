DROP PROCEDURE IF EXISTS FileInsert;
CREATE PROCEDURE `FileInsert`(
    `FilePath` VARCHAR(255),
    `FileExtension` VARCHAR(255)
)
    MODIFIES SQL DATA
BEGIN

    SET @existing = 0;
    SELECT COUNT(*)AS e INTO @existing FROM `OtherFiles` OT
    WHERE
        OT.`LibraryPath` = `LibraryPath`;
    IF @existing = 0 THEN
        INSERT INTO `OtherFiles` (InsertDateTime, LibraryPath, FileExtension)
        VALUES(NOW(), LibraryPath, FileExtension);
    END IF;
END