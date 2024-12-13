const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { check: checkFilter, update: updateFilter } = require('./filter');
const log = require('./log');

const MAX_LENGTH = 10;
const noop = () => { };

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

// TODO: add a responder chooser
// TODO: add a responder editor
// TODO: add a responder recorder option : lru(max) | all 
// TODO: add a responder recorder clear button


module.exports = (server, { storage }) => {
  log('resStatsServer start');
  /**
   * @type {Array<[string, number, {res: {body: string}}]>}
   */
  let sessions = [];
  let timer;
  const writeSessions = (dir) => {
    try {
      const text = sessions.slice();
      sessions = [];
      for (let i = 0, len = text.length; i < len; i++) {
        const item = text[i];
        const recordKey = md5(item[0]);
        const info ={
          url: item[0],
          timestamp: item[1],
          recordKey,
        };
        const infoFile = path.resolve(dir, recordKey + '.json');
        const contentFile = path.resolve(dir, recordKey + '.txt');
        fs.writeFile(infoFile, JSON.stringify(info), (err) => {
          if (err) {
            fs.writeFile(infoFile, JSON.stringify(info), (err) => {
              if (err) {
                log('writeSessions retry failed err', err);
              }
            });
          }
        });
        fs.writeFile(contentFile, item[2].res.body, (err) => {
          if (err) {
            fs.writeFile(contentFile, item[2].res.body, (err) => {
              if (err) {
                log('writeSessions retry failed err', err);
              }
            });
          }
        });
      }
    } catch (e) { }
  };
  updateFilter(storage.getProperty('filterText'));
  server.on('request', (req, res) => {
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
      // 这里应该检查这个响应是否是 由 file:// 协议生成的
      // 如果是的话，不记录
      if (s.rules && s.rules.files && s.rules.files.length) {
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
