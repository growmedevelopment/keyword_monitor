import Pusher from "pusher-js";

// Initialize Pusher (Soketi uses same protocol)
const pusher = new Pusher("local", {
    wsHost: import.meta.env.VITE_PUSHER_HOST, // change to `soketi` if frontend runs in Docker
    wsPort: import.meta.env.VITE_PUSHER_PORT,
    forceTLS: false,
    cluster: "mt1",
    enabledTransports: ["ws", "wss"],
});

export default pusher;