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
        document.getElementById("new_display_name").placeholder = "<change name>"
    }
    else {
        document.querySelector("#display_name").innerHTML = "&ltdisplay name&gt";
        document.getElementById("change_display_name_submit").innerHTML = "set"
        document.getElementById("new_display_name").placeholder = "<set name>"
    }

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

    // Form validation
    var forms = document.getElementsByClassName("needs-validation");
    // Loop over them and prevent submission
    var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener("submit", () => {
            if (form.checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add("was-validated");
            } else {
                display_name = document.querySelector("#new_display_name").value;
                localStorage.setItem("display_name", display_name);

                document.querySelector("#display_name").innerHTML = display_name;
                document.querySelector("#new_display_name").value = "";

                document.getElementById("change_display_name_submit").innerHTML = "change";
                document.getElementById("new_display_name").placeholder = "<change name>"
                
                form.classList.remove("was-validated");
                
                event.preventDefault();
            }
        }, false);
    });

        // // Handles change display name form
    // document.querySelector("#change_display_name").onsubmit = () => {
    //     display_name = document.querySelector("#new_display_name").value;
    //     localStorage.setItem("display_name", display_name);

    //     document.querySelector("#display_name").innerHTML = display_name;
    //     document.querySelector("#new_display_name").value = "";

    //     
        
    //     return false;
    // };

    function checkCustomValidity() {
        var input_field = this;
        var if_value = input_field.value
        // var valid_letters = "/^[abcde]+$/";
        var invalid_start = /^[ _-]/;
        var valid_letters = /^[a-zA-Z0-9 _-]+$/;
        var invalid_end = /[ _-]$/;
        if (if_value.length > 16) {
            input_field.setCustomValidity("Too long. Can't be longer than 16 characters.");
        } else if (if_value.length < 4) {
            input_field.setCustomValidity("Too short. Needs to be at least 4 characters.");          
        } else if (invalid_start.test(if_value)) {
            input_field.setCustomValidity("Invalid start character. First character must be letter or number.");
        // } else if (dn_value.match(valid_letters)) {
        } else if (!valid_letters.test(if_value)) {
            input_field.setCustomValidity("Invalid character. Display name must be alphanumeric.");
        } else if (invalid_end.test(if_value)) {
            input_field.setCustomValidity("Invalid end character. Last character must be letter or number.")
        } else {
            input_field.setCustomValidity("");
        }
        this.parentElement.getElementsByClassName("invalid-feedback")[0].innerHTML = input_field.validationMessage;
        // document.getElementById("dn_invalid_feedback").innerHTML = input_field.validationMessage;
        return;
    }

    document.getElementById("new_display_name").oninput = checkCustomValidity;

})
