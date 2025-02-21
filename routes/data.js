var express = require('express');
var router = express.Router();
var queries = require('../queries')

/* GET home page. */
router.get('/', async function(req, res, next) {
  payload = {
      draw: 0,
      recordsTotal: 0,
      recordsFiltered: 0,
      data : [],
  };

  cache = res.app.locals.cache; 

  try {
    data = await queries.queryTracks(req.query);
  } catch (error){
    payload.error = "Error has occured :" + error.toString();
    data = {
      totalPossible: 0,
      totalReturned: 0,
      data: [],
    }
    console.error(error);
  }

  payload.draw = parseInt(req.query.draw);
  payload.recordsTotal = cache.totalTracks;
  payload.recordsFiltered = data.totalPossible !== -1 ? data.totalPossible : cache.totalTracks;
  payload.data = data.data;
  
  res.setHeader('Content-Type', 'application/json');
  res.json(payload);
});

module.exports = router;
