const knex = require('./knex');

var getTotalCount = async function(cache){
    await knex.count('id as count')
        .from('KaraokeTracks')
        .first()
        .then(function(total){
            cache.totalTracks = total.count;
        });
};

module.exports.getTotalCount = getTotalCount;


const getQueryTotal = async function(sql) {
    qb = sql.clone();
    let count = 0;
    await qb.count('id as count').then(function(r){
        count = r[0].count;
    });
    return count;
}

module.exports.getQueryTotal = getQueryTotal;

const queryTracks = async function(query){
    columns = query.columns.map(rows => rows.data)

    sql = knex.distinct(columns).from('KaraokeTracks');

    if(query.search.value !== ''){
        searchParams = query.search.value.split(' ');

        columns.forEach(function(column, colIndex){
            if(colIndex === 0){
                sql.where(function(qb){
                   searchParams.forEach(function(string, stringIndex){ 
                        if(stringIndex = 0){
                            qb.whereILike(column, '%' + string + '%');
                        }else{
                            qb.orWhereILike(column, '%' + string + '%');
                        }
                    });
                });
            }else{
                sql.orWhere(function(qb){
                    searchParams.forEach(function(string, stringIndex){ 
                         if(stringIndex = 0){
                             qb.whereILike(column, '%' + string + '%');
                         }else{
                             qb.orWhereILike(column, '%' + string + '%');
                         }
                     });
                 });
            };
        });
    };

    console.log(sql.toSQL().toNative());
    totalFiltered = await getQueryTotal(sql);
  
    sql.limit(query.length)
    sql.offset(query.start);

    orderArray = [];

    query.order.forEach(function(obj, i){
        orderArray.push({
            column: columns[parseInt(obj.column)],
            order: obj.dir
        })
    });


    rows = await sql.select();
    
    console.log(sql.toSQL().toNative());

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