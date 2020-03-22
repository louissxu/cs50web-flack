document.addEventListener("DOMContentLoaded", () => {
    
    // Sets display name. Pulls from local storage if saved previously
    var display_name = null;
    if (localStorage.getItem("display_name") != null) {
        display_name = localStorage.getItem("display_name");
        document.querySelector("#display_name").innerHTML = display_name;
    }

    // Handles change display name form
    document.querySelector("#change_display_name").onsubmit = () => {
        display_name = document.querySelector("#new_display_name").value;
        localStorage.setItem("display_name", display_name);

        document.querySelector("#display_name").innerHTML = display_name;
        document.querySelector("#new_display_name").value = "";
        
        return false;
    };

    // Connect to websocket
    var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

    // When connected, configure buttons
    socket.on("connect", () => {
        // Submit button should emit a "submit message" event
        document.querySelector("#submit_new_message").onsubmit = () => {
            const new_message = document.querySelector("#new_message").value;
            socket.emit("submit message", {"message": new_message, "username": display_name});
            
            return false;
        };
    });

    // When a new message is announced, add it to the unordered list
    socket.on("announce message", data => {
        const li = document.createElement("li");
        test = `${data.message}`;
        li.innerHTML = `${data.timestamp} - ${data.username}: ${data.message}`;
        document.querySelector("#messages").append(li);
    });

})
