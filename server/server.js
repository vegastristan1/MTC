const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/SorMaster', require('./routes/sorMaster'));
app.use('/api/ArTrnSummary', require('./routes/arTrnSummary'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));