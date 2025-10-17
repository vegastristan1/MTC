const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const config = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/users', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`SELECT * FROM Users`;
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

// Test API route
app.get('/api/SorMaster', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('Select TOP 100 * From  SorMaster');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Databse Server Error');
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));