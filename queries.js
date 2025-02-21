const knex = require('./knex');
const { search } = require('./routes');

var getTotalCount = async function(cache){
    var count = await knex('DistinctTracks').count();
    cache.totalTracks = count[0]['count(*)'];
};

module.exports.getTotalCount = getTotalCount;


const getQueryTotal = async function(sql, columns) {
    let count = 0;

    qb = sql.clone().count();
    await qb.then(function(r){
        count = r[0].count;
    });

    console.log(qb.toSQL().toNative());
    return count;
}

module.exports.getQueryTotal = getQueryTotal;

const queryTracks = async function(query){
    var columns = query.columns.map(rows => rows.data)
    var sql = knex('DistinctTracks').distinct(columns);
    var searchParams = query.search.value.split(' ');
    var totalFiltered = -1;

    if(searchParams.length > 0 && searchParams[0] !== ''){      
        searchParams.forEach(function(string, stringIndex){ 
            if(stringIndex = 0){
                sql.whereILike("SearchStringAlt", `%${string}%`);
            }else{
                sql.andWhereILike("SearchStringAlt", `%${string}%`);
            }
        });

        var rowCount = await sql.clone().count();//await getQueryTotal(sql, columns);
        totalFiltered = rowCount[0]["count(*)"]
    };
  
    sql.limit(query.length)
    sql.offset(query.start);

    var orderArray = [];

    query.order.forEach(function(obj, i){
        orderArray.push({
            column: columns[parseInt(obj.column)],
            order: obj.dir
        })
    });

    var rows = await sql.select();
    
    return {
        data: rows,
        totalPossible: totalFiltered,
        totalReturned: rows.length
    };
}

module.exports.queryTracks = queryTracks;

module.exports.insertTrack = async function(data) {
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

module.exports.insertOtherFiles = async function(data) {
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
}

module.exports.getExistingKaraokeFiles = async function(){
    var sql = knex.columns("LibraryPath")
        .from('KaraokeTracks');

   return await sql.select();
}

module.exports.getExistingOtherFiles = async function() {
    var sql = knex.columns("LibraryPath")
        .from('OtherFiles');

   return await sql.select();
}