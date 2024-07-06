const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// List of backend API servers
const servers = [
    { url: 'http://localhost:4000', load: 0 },
    { url: 'http://localhost:4001', load: 0 },
    { url: 'http://localhost:4002', load: 0 },
];

// Custom load balancing strategy: Round Robin with load checking
let currentIndex = 0;

function getNextServer() {
    let server = servers[currentIndex];
    currentIndex = (currentIndex + 1) % servers.length;
    return server;
}

async function checkServerHealth(server) {
    try {
        const response = await axios.get(`${server.url}/health`);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

app.use(async (req, res) => {
    let server;
    let isHealthy = false;

    // Find a healthy server
    for (let i = 0; i < servers.length; i++) {
        server = getNextServer();
        isHealthy = await checkServerHealth(server);
        if (isHealthy) break;
    }

    if (!isHealthy) {
        return res.status(503).send('No healthy servers available');
    }

    // Proxy the request to the chosen server
    const url = `${server.url}${req.originalUrl}`;
    try {
        const response = await axios({
            method: req.method,
            url: url,
            data: req.body,
            headers: { ...req.headers },
        });
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send('Error proxying request');
    }
});

app.listen(port, () => {
    console.log(`Load balancer running on port ${port}`);
});
