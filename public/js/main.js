const touchArea = document.getElementById('touch-area');
const touchCount = document.getElementById('touch-count');
const activeTouches = new Map();
const socket = io();

// Enable touch events for testing without TUIO
tuioClient.enableTouchEvents(touchArea);

// Handle TUIO events from WebSocket client
tuioClient.on('addTuioCursor', (cursor) => {
    createTouchPoint(cursor);
});

tuioClient.on('updateTuioCursor', (cursor) => {
    updateTouchPoint(cursor);
});

tuioClient.on('removeTuioCursor', (cursor) => {
    removeTouchPoint(cursor);
});

// Handle TUIO events from Socket.IO (server-side)
socket.on('tuio-cursor-add', (cursor) => {
    createTouchPoint(cursor);
});

socket.on('tuio-cursor-update', (cursor) => {
    updateTouchPoint(cursor);
});

socket.on('tuio-cursor-remove', (cursor) => {
    removeTouchPoint(cursor);
});

function createTouchPoint(cursor) {
    const touchElement = document.createElement('div');
    touchElement.className = 'touch-point';
    touchElement.id = `touch-${cursor.id}`;
    updateTouchPosition(touchElement, cursor);
    touchArea.appendChild(touchElement);
    activeTouches.set(cursor.id, touchElement);
    updateTouchCounter();
}

function updateTouchPoint(cursor) {
    const touchElement = activeTouches.get(cursor.id);
    if (touchElement) {
        updateTouchPosition(touchElement, cursor);
    }
}

function removeTouchPoint(cursor) {
    const touchElement = activeTouches.get(cursor.id);
    if (touchElement) {
        touchElement.remove();
        activeTouches.delete(cursor.id);
        updateTouchCounter();
    }
}

function updateTouchPosition(element, cursor) {
    const rect = touchArea.getBoundingClientRect();
    element.style.left = `${cursor.x * rect.width}px`;
    element.style.top = `${cursor.y * rect.height}px`;
}

function updateTouchCounter() {
    touchCount.textContent = activeTouches.size;
}