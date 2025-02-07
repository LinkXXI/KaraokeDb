const chokidar = require('chokidar');
const path = require('path');
const md5 = require('md5-file');
var mysql = require('mysql');

if(!process.env.DB_NAME){
    var dotenv = require('dotenv');
    dotenv.config({ path: './.env' });
}

queries = {
    getExistingOtherFiles: async function() {
        var sql = knex.columns("LibraryPath")
            .from('OtherFiles');

        return await sql.select();

        //return connection.query('SELECT DISTINCT LibraryPath FROM OtherFiles', function(error, result, field) {
        //    if (error){
        //        consoleOutput(error);
        //    }
        //});
    },

    getExistingKaraokeFiles: async function(){
        var sql =  knex.columns("LibraryPath")
            .from('KaraokeTracks');
    
       return await sql.select();

       //return connection.query('SELECT DISTINCT LibraryPath FROM KaraokeTracks', function(error, result, field) {
        //    if (error){
        //        consoleOutput(error);
        //    }
        //});
    },

    insertOtherFiles : async function(libraryPath, fileExtension) {
        //knex('OtherFiles')
        //    .insert(data)
        //    .catch(function (error){
        //        consoleOutput(`insert failed ${error} path: ${data.LibraryPath}`);
        //    });
        //return knex.raw('CALL `FileInsert`(?, ?)', [libraryPath, fileExtension])
        //    .then((e) => consoleOutput(e));
        return connection.query('CALL FileInsert(?, ?);', [libraryPath, fileExtension]);
    },

    insertTrack: async function(trackArtist, trackName, karaokeTrackId, libraryPath, fileSize, fileHash) {
        //knex('KaraokeTracks')
        //.insert(data)
        //.catch(function (error){
        //    consoleOutput(`insert failed ${error} path: ${data.LibraryPath}`);
        //});
        //return knex.raw('CALL `TrackInsert`(?, ?, ?, ?, ?, ?');, [trackArtist, trackName, karaokeTrackId, libraryPath, fileSize, fileHash])
        //    .then((e) => consoleOutput(e));
        return connection.query('CALL TrackInsert(?, ?, ?, ?, ?, ?, ?);', [trackArtist, trackName, karaokeTrackId, libraryPath, fileSize, fileHash]);
    }

}

const knex = require('knex')({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {min: 0, max: 5 },
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

const ignoreInitial = process.env.IGNORE_INITIAL.toLowerCase() === 'true';
const monitoringServiceEnabled = process.env.MONITORING_SERVICE.toLowerCase() === 'true';
const libraryPath = '/Karaoke';

const cache = {
    existingKaraokeFiles: [],
    existingOtherFiles: [],
    watcher: {},
};

const karaokeTypes = [
    "zip",
    "mp4",
    "avi",
    "wmv"
]

function consoleOutput(consoleMessage){
    if(!!process.send){
        process.send(consoleMessage)
    }else{
        console.log(consoleMessage);
    }
}

function isKaraokeTrack(filePath){
    return karaokeTypes.includes(filePath.substring(filePath.length - 3))
}

async function logKaraokeTrack(filePath){

    var filename = path.basename(filePath, path.extname(filePath));

    var parts = filename.split(' - ');
    if(parts.length == 1){
        parts = filename.split('_-_');

        if(parts.length == 1){
            //If after the second split, it still doesn't have more than 1 part, it's not a karaoke track in the correct format.
            logOtherFiles(filePath).then((r) => consoleOutput('file insert complete'));
            return;
        }
    }

    var hash = md5.sync(filePath);

    var data = {
        TrackArtist: parts[1],
        TrackName: parts[2],
        KaraokeTrackId: parts[0],
        FileSize: fs.statSync(filePath).size,
        FileHash: hash,
    };

    consoleOutput(`new track found!\n\tArtist: ${data.TrackArtist}\n\tTrack: ${data.TrackName}\n\tID: ${KaraokeTrackId}`);
    return queries.insertTrack(data.TrackArtist, data.TrackName, data.KaraokeTrackId, data.FileSize, data.FileHash);   
}

async function logOtherFiles(filePath){
    var data = {
        LibraryPath: filePath,
        FileExtension: filePath.substring(filePath.length - 3)
    }
    
    consoleOutput(`logging non karaoke file: ${data.LibraryPath}`)
    return queries.insertOtherFiles(data.LibraryPath, data.FileExtension);
}

var start = async function(){
    if(monitoringServiceEnabled){

        consoleOutput(`Monitoring Service is enabled!`);

        if(!ignoreInitial){
            consoleOutput(`Igore Initial is FALSE, scanning all files`);
        }else{
            consoleOutput(`Igore Initial is TRUE, only monitoring for new files`);
        }

        cache.existingKaraokeFiles = await queries.getExistingKaraokeFiles();
        cache.existingOtherFiles = await queries.getExistingOtherFiles();

        cache.watcher = chokidar.watch(libraryPath, {
            persistent: true,
            ignoreInitial: ignoreInitial,
        });

        cache.watcher.on('add', function(filePath){
            var cleanPath = filePath.substring(libraryPath.length);

            if(!!cache.existingKaraokeFiles.find((e) => e.LibraryPath == cleanPath)){
                return;
            }else if(!!cache.existingOtherFiles.find((e) => e.LibraryPath == cleanPath)){
                return;
            } else{
                if(isKaraokeTrack(filePath)){
                    try{
                        logKaraokeTrack(filePath).then('file insert complete');
                    }catch (error){
                        consoleOutput(`unable to log karaoke track: ${filePath} \n ${error.name}: ${error.message}`);
                    }
                }else{
                    try{
                        logOtherFiles(filePath).then('file insert complete');
                    }catch (error){
                        consoleOutput(`unable to log other file: ${filePath} \n ${error.name}: ${error.message}`);
                    }
                }
            }
        });
    }
}

module.exports.start = start;

module.exports.watcher = cache.watcher;

start();