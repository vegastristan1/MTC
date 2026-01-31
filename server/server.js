const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/MRChecker', require('./routes/mrChecker'));
app.use('/api/allStockCheckerInventory', require('./routes/allStockCheckerInventory'));
app.use('/api/pending', require('./routes/pending'));
app.use('/api/totalsales', require('./routes/totalsales'));
app.use('/api/totalordertoday', require('./routes/totalordertoday'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
