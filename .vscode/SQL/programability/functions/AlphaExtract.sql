DROP FUNCTION IF EXISTS AlphaExtract;
CREATE FUNCTION `AlphaExtract`(extractString NVARCHAR(255)) RETURNS varchar(255) CHARSET utf8mb3 COLLATE utf8mb3_uca1400_ai_ci
BEGIN 

    return REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        REPLACE(extractString, '9', ''), '8', ''), '7', ''), '6', ''), '5', ''), '4', ''),
         '3', ''), '2', ''), '1', ''), '0', ''), '-', '');
END