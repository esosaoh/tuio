const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const osc = require('osc');

// Serve static files from public directory
app.use(express.static('public'));

// Create OSC UDP Port for TUIO (default TUIO port is 3333)
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 3333
});

// Listen for incoming OSC messages
udpPort.on("message", function (oscMsg) {
    if (oscMsg.address === "/tuio/2Dcur") {
        const command = oscMsg.args[0];
        
        switch (command) {
            case "set":
                // TUIO set message format: [sessionId, x, y, xVel, yVel, accel]
                io.emit('tuio-cursor-update', {
                    id: oscMsg.args[1],
                    x: oscMsg.args[2],
                    y: oscMsg.args[3]
                });
                break;
            case "alive":
                // Handle alive messages to track active cursors
                const activeIds = oscMsg.args.slice(1);
                io.emit('tuio-cursors-alive', activeIds);
                break;
        }
    }
});

// Handle errors
udpPort.on("error", function (error) {
    console.log("An error occurred: ", error.message);
});

// Open the socket
udpPort.open();

// When the port is ready
udpPort.on("ready", function () {
    console.log("TUIO/OSC listening on port", udpPort.options.localPort);
});

// Start the server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});