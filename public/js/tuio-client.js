class TuioClient {
    constructor() {
        this.cursors = new Map();
        this.listeners = {
            addTuioCursor: [],
            updateTuioCursor: [],
            removeTuioCursor: [],
        };

        // Try to connect via WebSocket if TUIO is being served over WebSocket
        this.connectWebSocket();
    }

    connectWebSocket() {
        try {
            // Attempt to connect to TUIO WebSocket (default port 8080)
            this.ws = new WebSocket('ws://localhost:8080');

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleTuioMessage(data);
                } catch (e) {
                    console.error('Error parsing TUIO message:', e);
                }
            };

            this.ws.onopen = () => {
                console.log('TUIO WebSocket connected');
            };

            this.ws.onerror = (error) => {
                console.log('TUIO WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('TUIO WebSocket closed');
                // Try to reconnect after 5 seconds
                setTimeout(() => this.connectWebSocket(), 5000);
            };
        } catch (e) {
            console.log('WebSocket connection failed:', e);
        }
    }

    handleTuioMessage(data) {
        switch (data.type) {
            case 'add':
                this.cursors.set(data.id, data);
                this.emit('addTuioCursor', data);
                break;
            case 'update':
                if (this.cursors.has(data.id)) {
                    this.cursors.set(data.id, data);
                    this.emit('updateTuioCursor', data);
                }
                break;
            case 'remove':
                if (this.cursors.has(data.id)) {
                    this.cursors.delete(data.id);
                    this.emit('removeTuioCursor', data);
                }
                break;
        }
    }

    // Event handling methods
    on(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].push(callback);
        }
    }

    off(eventName, callback) {
        if (this.listeners[eventName]) {
            this.listeners[eventName] = this.listeners[eventName]
                .filter(cb => cb !== callback);
        }
    }

    emit(eventName, data) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => callback(data));
        }
    }

    // Browser Touch Event Handling
    // This allows testing without a TUIO source by converting regular touch events to TUIO-like events
    enableTouchEvents(element) {
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            Array.from(e.changedTouches).forEach(touch => {
                const rect = element.getBoundingClientRect();
                const data = {
                    id: touch.identifier,
                    x: (touch.clientX - rect.left) / rect.width,
                    y: (touch.clientY - rect.top) / rect.height,
                    type: 'add'
                };
                this.handleTuioMessage(data);
            });
        });

        element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            Array.from(e.changedTouches).forEach(touch => {
                const rect = element.getBoundingClientRect();
                const data = {
                    id: touch.identifier,
                    x: (touch.clientX - rect.left) / rect.width,
                    y: (touch.clientY - rect.top) / rect.height,
                    type: 'update'
                };
                this.handleTuioMessage(data);
            });
        });

        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            Array.from(e.changedTouches).forEach(touch => {
                const data = {
                    id: touch.identifier,
                    type: 'remove'
                };
                this.handleTuioMessage(data);
            });
        });

        element.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            Array.from(e.changedTouches).forEach(touch => {
                const data = {
                    id: touch.identifier,
                    type: 'remove'
                };
                this.handleTuioMessage(data);
            });
        });
    }
}

// Create global instance
const tuioClient = new TuioClient();