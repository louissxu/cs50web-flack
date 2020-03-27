document.addEventListener("DOMContentLoaded", () => {
    
    // Ref: https://stackoverflow.com/questions/6168260/how-to-parse-a-url
    // Ref: https://stackoverflow.com/questions/3213531/creating-a-new-location-object-in-javascript/3213643#3213643
    var url = window.location.href;
    var url_parser = document.createElement("a")
    url_parser.href = url
    var url_pathname = url_parser.pathname

    var channel_name;

    if (url_pathname == "/"){
        // Check for flashes and blank out old channel redirect if there are any flashes (ie stay on index page)
        var flashes = document.querySelector(".alert");
        if (flashes != null) {
            localStorage.removeItem("channel_name")
        }

        previous_channel = localStorage.getItem("channel_name");
        if (previous_channel != null) {
            // Redirect to relative address. Ref: https://www.geeksforgeeks.org/how-to-redirect-to-a-relative-url-in-javascript/
            window.location.href = "/channel/" + previous_channel;

            // // Have to do it this way rather than url.hostname because this uses nonstandard port
            // var initial_url_arr = window.location.href.split("/")
            // var initial_url = initial_url_arr[0] + "//" + initial_url_arr[2]
            // alert(initial_url + "/channel/" + previous_channel);       
        }
    }
    else {
        var url_path_array = url_pathname.split("/");
        
        if (url_path_array[1] == "channel"){
            // Pull channel_name from url path then set it to local storage
            channel_name = url_path_array[2]
            localStorage.setItem("channel_name", channel_name);

            // // Hack - Pull variable name from html content
            // const channel_name = document.querySelector("#channel_name").innerHTML
        }
    }

    // Sets display name. Pulls from local storage if saved previously
    var display_name = null;
    if (localStorage.getItem("display_name") != null) {
        display_name = localStorage.getItem("display_name");
        document.querySelector("#display_name").innerHTML = display_name;
        // document.getElementById("new_display_name").placeholder = "change display name"
        document.getElementById("change_display_name_submit").innerHTML = "change"
    }
    else {
        document.querySelector("#display_name").innerHTML = "Display Name";
        document.getElementById("change_display_name_submit").innerHTML = "set"
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
            socket.emit("submit message", {"message": new_message, "username": display_name, "channel": channel_name});
            
            return false;
        };
    });

    // When a new message is announced, add it to the unordered list
    socket.on("announce message", data => {
        if (data.channel == channel_name){
            const li = document.createElement("li");
            test = `${data.message}`;
            li.innerHTML = `${data.timestamp} - ${data.username}: ${data.message}`;
            document.querySelector("#messages").append(li);
        }
    });

})
