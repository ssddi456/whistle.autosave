const fs = require('fs');
const path = require('path');
const { check: checkFilter, update: updateFilter } = require('./filter');
const log = require('./log');

const MAX_LENGTH = 10;
const noop = () => {};

module.exports = (server, { storage }) => {
  log('resStatsServer start');
  let sessions = [];
  let timer;
  const writeSessions = (dir) => {
    try {
      const text = sessions.slice();
      sessions = [];
      for (let i = 0, len = text.length; i < len; i++) {
        const item = text[i];
        const fileName = `${encodeURIComponent(item[0])}______${item[1]}.txt`;
        dir = path.resolve(dir, fileName);
        fs.writeFile(dir, text[2], (err) => {
          if (err) {
            fs.writeFile(dir, text, noop);
          }
        });
      }
    } catch (e) {}
  };
  updateFilter(storage.getProperty('filterText'));
  server.on('request', (req) => {
    const active = storage.getProperty('active');
    if (!active) {
      return;
    }
    const dir = storage.getProperty('sessionsDir');
    if (!dir || typeof dir !== 'string') {
      sessions = [];
      return;
    }
    const ifPass = checkFilter(req.originalReq.url);
    if (!ifPass) {
      return;
    }
    req.getSession((s) => {
      if (!s) {
        return;
      }
      clearTimeout(timer);
      sessions.push([req.originalReq.url, Date.now(), s]);
      if (sessions.length >= MAX_LENGTH) {
        writeSessions(dir);
      } else {
        // 10秒之内没满10条强制写入
        timer = setTimeout(() => writeSessions(dir), 10000);
      }
    });
  });
};
