const chokidar = require('chokidar');
const path = require('path');
const md5 = require('md5-file');

if(!process.env.DB_NAME){
    var dotenv = require('dotenv');
    dotenv.config({ path: './.env' });
}

queries = {
    getExistingOtherFiles: async function() {
        var sql = knex.columns("LibraryPath")
            .from('OtherFiles');

        return await sql.select();
    },

    getExistingKaraokeFiles: async function(){
        var sql = knex.columns("LibraryPath")
            .from('KaraokeTracks');
    
       return await sql.select();
    },

    insertOtherFiles : async function(data) {
        var  message = 'insert triggered'
        console.log(message);
        if(!!process.message){
            process.message(message);
        }
                
        knex('OtherFiles')
            .insert(data)
            .then(function (r){
                message = `insert successful ${r} path: ${data.LibraryPath}`
                console.log(message);
                if(!!process.message){
                    process.message(message);
                }
            }).catch(function (error){
                var message = `insert failed ${error} path: ${data.LibraryPath}`
                console.log(message);
                if(!!process.message){
                    process.message(message);
                }
            });
    },

    insertTrack: async function(data) {
        knex('KaraokeTracks')
        .insert(data)
        .then(function (r){
            var logMessage = `insert successful ${r} path: ${data.LibraryPath}`
            console.log(logMessage);
            process.message(logMessage);
        }).catch(function (error){
            var logMessage = `insert failed ${error} path: ${data.LibraryPath}`
            console.log(logMessage);
            process.message(logMessage);
        });
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
            logOtherFiles(filePath).then('file insert complete');
            return;
        }
    }

    var hash = md5.sync(filePath);

    var data = {
        InsertDateTime: new Date().toISOString().replace('Z', ' ').replace('T', ' '),
        TrackArtist: parts[1],
        TrackName: parts[2],
        KaraokeTrackId: parts[0],
        FileSize: fs.statSync(filePath).size,
        FileHash: hash,
        KaraokeBrand: parts[0].replace(/[^a-zA-Z]+/g, '')
    };

    console.log(`new track found!\n\tArtist: ${data.TrackArtist}\n\tTrack: ${data.TrackName}\n\tID: ${KaraokeTrackId}`);
    if(!!process.send){
        process.send(`new track found!\n\tArtist: ${data.TrackArtist}\n\tTrack: ${data.TrackName}\n\tID: ${KaraokeTrackId}`)
    }
    queries.insertTrack(data);   
}

async function logOtherFiles(filePath){
    var data = {
        InsertDateTime: new Date().toISOString().replace('Z', ' ').replace('T', ' '),
        LibraryPath: filePath,
        FileExtension: filePath.substring(filePath.length - 3)
    }

    console.log(`logging non karaoke file: ${data.LibraryPath}`)
    if(!!process.send){
        process.send(`logging non karaoke file: ${data.LibraryPath}`)
    }
    queries.insertOtherFiles(data);
}

var start = async function(){
    if(monitoringServiceEnabled){

        console.log(`Monitoring Service is enabled!`);
        if(!!process.send){
            process.send(`Monitoring Service is enabled!`);
        
        }

        if(!ignoreInitial){
            console.log(`Igore Initial is FALSE, scanning all files`);
            if(!!process.send){
                process.send(`Igore Initial is FALSE, scanning all files`);
            }
        }else{
            console.log(`Igore Initial is TRUE, only monitoring for new files`);
            if(!!process.send){
                process.send(`Igore Initial is TRUE, only monitoring for new files`);
            }
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
                        console.error(`unable to log karaoke track: ${filePath} \n ${error.name}: ${error.message}`);
                        if(!!process.send){
                            process.send(`unable to log karaoke track: ${filePath} \n ${error.name}: ${error.message}`);
                        }
                    }
                }else{
                    try{
                        logOtherFiles(filePath).then('file insert complete');
                    }catch (error){
                        console.error(`unable to log other file: ${filePath} \n ${error.name}: ${error.message}`);
                        if(!!process.send){
                            process.send(`unable to log other file: ${filePath} \n ${error.name}: ${error.message}`)
                        }
                    }
                }
            }
        });
    }
}

module.exports.start = start;

start();