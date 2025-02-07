DROP FUNCTION LibraryPathExtract;
CREATE FUNCTION `LibraryPathExtract`(extractString NVARCHAR(255)) RETURNS varchar(255) CHARSET utf8mb3 COLLATE utf8mb3_uca1400_ai_ci
BEGIN 

    return RIGHT(extractString, LENGTH(extractString) - LENGTH('\\\\10.0.2.2\\Karaoke\\KARAOKE MERGED ALPHA (DECEMBER 2021)'));
END