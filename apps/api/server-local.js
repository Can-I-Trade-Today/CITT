'use strict';

const app = require('./functions/server');

app.app.listen(3000, () => console.log('Local app listening on port 3000!'));
