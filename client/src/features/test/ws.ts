const token = localStorage.getItem('token') || '';
const ws = new WebSocket('ws://localhost/ws', ['access_token', token]);

export default ws;