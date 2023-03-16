const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT || 8000;

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.use('/api/insights', require('./routes/insights'));

app.listen(port, () => console.log(`Servers is running on port ${port}!`));
