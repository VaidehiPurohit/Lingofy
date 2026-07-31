
// to allow mobile devices on the same Wi-Fi to connect to the backend.

// Laptop/Local Development
const API_BASE_URL_LOCALHOST = "http://localhost:5000";

// Mobile Demo (change IP to your laptop's current IP)
// Get IP: Run 'ipconfig' on Windows, find IPv4 address
const API_BASE_URL_MOBILE = "http://192.168.39.155:5000";

// Toggle between localhost and mobile here
// For laptop only: use API_BASE_URL_LOCALHOST
// For laptop + mobile same time: use API_BASE_URL_MOBILE

export const API_BASE_URL = API_BASE_URL_MOBILE;
