const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/', (req, res) => {
    res.send(`Hello from server on port ${port}`);
});

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
