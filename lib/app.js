const express = require('express');
const app = express();

/* middleware */
const morgan = require('morgan');
const redirectHttp = require('./redirect-http')();
const cors = require('cors')();
const checkDb = require('./check-connection')();
const errorHandler = require('./error-handler')();

app.use(morgan('dev'));
// Redirect http to https in production
if(process.env.NODE_ENV === 'production') {
    app.use(redirectHttp);
}
app.use(cors);
app.use(express.static('./public'));

/* routes */
const stores = require('./routes/stores');
const pets = require('./routes/pets');
app.use(checkDb);
app.use('/api/stores', stores);
app.use('/api/pets', pets);

app.use(errorHandler);

module.exports = app;