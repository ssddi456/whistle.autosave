const active = require('./cgi/active');
const getSettings = require('./cgi/getSettings');
const setSettings = require('./cgi/setSettings');
const getRecords = require('./cgi/getRecords');

module.exports = (router) => {
  router.post('/cgi-bin/active', active);
  router.get('/cgi-bin/get-settings', getSettings);
  router.post('/cgi-bin/set-settings', setSettings);
  router.get('/cgi-bin/get-records', getRecords);
};
