const fs = require('fs');
const path = require('path');

module.exports = (ctx) => {
    const { localStorage } = ctx.req;
    const dir = localStorage.getProperty('sessionsDir');
    if (!dir || typeof dir !== 'string') {
      sessions = [];
      return;
    }
    // get all records
    const files = fs.readdirSync(dir);

    const records = files.filter((file) => file.endsWith('.json'))
        .map((file) => {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            try {
                const data = JSON.parse(content);
                return {
                    key: file.replace('.json', ''),
                    url: data.url,
                    order: data.timestamp,
                    timestamp: new Date(data.timestamp).toLocaleString(),
                    file: path.join(dir, file.replace('.json', '.txt')),
                };
            } catch (error) {
                
            }
        })
        .filter(Boolean)
        .sort((a, b) => b.order - a.order);
    
    ctx.body = {
        ec: 0,
        records,
    };
};
