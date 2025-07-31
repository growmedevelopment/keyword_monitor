import Pusher from "pusher-js";

// Initialize Pusher (Soketi uses same protocol)
const pusher = new Pusher("local", {
    wsHost: "127.0.0.1", // change to `soketi` if frontend runs in Docker
    wsPort: 6001,
    forceTLS: false,
    cluster: "mt1",
    enabledTransports: ["ws", "wss"],
});

export default pusher;