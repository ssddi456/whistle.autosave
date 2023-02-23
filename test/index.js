const filter = require('../lib/filter');;
const assert = require('assert');
const rules = `
!/\/(sockjs-node|socket\.io)\// /^http(s)?://test*\-hetong.ke.com/ !/\.(js|css|ico|jpeg|png)$/i
!/\/(sockjs-node|socket\.io)\// /^http(s)?://dev-hetong.ke.com/ !/\.(js|css|ico|jpeg|png)$/i
`;

const postive_urls = [
    'https://dev-hetong.ke.com/api/workbench/detail?project_id=10000029',
    'https://dev-hetong.ke.com/api/commissionMatch/getSaleCities?projectId=10000029&detailType=1',
    'https://dev-hetong.ke.com/api/workbench/detailItem?project_id=10000029&workbench_id=128&workbench_rule_type=1&commission_id=365&bpm_id=',
];
const negtive_urls = [
    'https://dev-hetong.ke.com/sockjs-node/122/js0dcqfm/eventsource',
    'https://darius.api.ke.com/apollo/config',
];

filter.update(rules);
postive_urls.forEach((url) => {
    assert(filter.check(url), `url: ${url} should pass`);
});
negtive_urls.forEach((url) => {
    assert(!filter.check(url), `url: ${url} should not pass`);
});