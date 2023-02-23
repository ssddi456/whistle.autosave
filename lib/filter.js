const log = require("./log");

const REG_EXP_RE = /^\/(.+)\/(i)?$/;
let filterList;

const toRegExp = (/** @type {string} */regExp) => {
  // this line will contain multiple RegExp
  // so we need to check if it's a RegExp
  if (regExp.indexOf('/') === -1
    && regExp.indexOf('*') === -1
    && regExp.indexOf('?') === -1
  ) {
    return null;
  }
  // this is a space separated list of RegExp
  // cut it
  const regExpStrs = regExp.split(/\s+/);
  const testRegExps = regExpStrs.map((regExpStr) => {
    const not = regExpStr[0] === '!';
    if (regExpStr[0] == '!') {
      regExpStr = regExpStr.substring(1);
    }
    const regMatch = regExpStr.match(REG_EXP_RE);
    if (regMatch) {
      const reg = new RegExp(regMatch[1], regMatch[2]);
      return (url) => reg.test(url) ? !not : not;
    }
    return (url) => url.indexOf(regExpStr) !== -1 ? !not : not;
  });

  return {
    test: (url) => {
      for (let i = 0, len = testRegExps.length; i < len; i++) {
        if (!testRegExps[i](url)) {
          return false;
        }
      }
      return true;
    }
  };
};

exports.update = function(text) {
  text = typeof text === 'string' ? text.trim() : '';
  if (!text) {
    filterList = null;
    return;
  }
  const _filterList = [];
  text = text.substring(0, 3072).split(/\r\n|\r|\n/);
  text.forEach((str) => {
    str = str.trim();
    if (!str) {
      return;
    }
    const pattern = toRegExp(str);
    _filterList.push({ pattern, str });
  });
  log('update filter', _filterList);
  filterList = _filterList;
};

exports.check = function(url) {
  if (!filterList) {
    return true;
  }
  if (!url || typeof url !== 'string') {
    return false;
  }
  for (let i = 0, len = filterList.length; i < len; i++) {
    const { pattern, str } = filterList[i];
    const result = pattern ? pattern.test(url) : url.indexOf(str) !== -1;
    if (result) {
      return true;
    }
  }
};
