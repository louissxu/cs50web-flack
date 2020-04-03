// Declare template for message line
const message_line = Handlebars.compile(document.querySelector("#message_template").innerHTML);
const date_line = Handlebars.compile(document.querySelector("#date_template").innerHTML);

document.addEventListener("DOMContentLoaded", () => {
    
    // Ref: https://stackoverflow.com/questions/6168260/how-to-parse-a-url
    // Ref: https://stackoverflow.com/questions/3213531/creating-a-new-location-object-in-javascript/3213643#3213643
    var url = window.location.href;
    var url_parser = document.createElement("a")
    url_parser.href = url
    var url_pathname = url_parser.pathname

    var channel_name;

    if (url_pathname == "/"){
        //If on root page. Make select channel overlay visible
        document.getElementById("overlay2").style.visibility = "visible"

        // Check for flashes and blank out old channel redirect if there are any flashes (ie stay on index page)
        var flashes = document.querySelector(".alert");
        if (flashes != null) {
            localStorage.removeItem("channel_name")
        }

        previous_channel = localStorage.getItem("channel_name");
        if (previous_channel != null) {
            // Redirect to relative address. Ref: https://www.geeksforgeeks.org/how-to-redirect-to-a-relative-url-in-javascript/
            window.location.href = "/channel/" + previous_channel;    
        }
    }
    else {
        var url_path_array = url_pathname.split("/");
        
        if (url_path_array[1] == "channel"){
            // Pull channel_name from url path then set it to local storage
            channel_name = url_path_array[2];
            localStorage.setItem("channel_name", channel_name);
        }
    }

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
                form.classList.remove("was-validated");
            }
        }, false);
    });

    // Sets display name. Pulls from local storage if saved previously
    var display_name = null;
    if (localStorage.getItem("display_name") != null) {
        display_name = localStorage.getItem("display_name");
        document.querySelector("#display_name").innerHTML = display_name;
        document.getElementById("change_display_name_submit").innerHTML = "change"
        document.getElementById("new_display_name").placeholder = "<change name>"
    }
    else {
        document.querySelector("#display_name").innerHTML = "&ltdisplay name&gt";
        document.getElementById("change_display_name_submit").innerHTML = "set"
        document.getElementById("new_display_name").placeholder = "<set name>"
        document.getElementById("overlay1").style.visibility = "visible"
    }

    // Handles change display name form
    document.querySelector("#change_display_name").onsubmit = () => {
        if (document.getElementById("change_display_name").checkValidity()) {
            display_name = document.querySelector("#new_display_name").value;
            localStorage.setItem("display_name", display_name);
        
            document.querySelector("#display_name").innerHTML = display_name;
        
            document.getElementById("change_display_name_submit").innerHTML = "change";
            document.getElementById("new_display_name").placeholder = "<change name>";

            document.getElementById("new_display_name").classList.remove("was-validated")
            document.querySelector("#new_display_name").value = "";

            // Get rid of startup overlay if present
            if (document.getElementById("overlay1").style.visibility == "visible") {
                document.getElementById("overlay1").style.visibility = "hidden"
            }
            return false;
        }
    }

    // Connect to websocket
    var socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

    // When connected, configure buttons
    socket.on("connect", () => {
        // Submit button should emit a "submit message" event
        document.querySelector("#submit_new_message").onsubmit = () => {
            const new_message = document.querySelector("#new_message").value;
            document.querySelector("#new_message").value = "";
            socket.emit("submit message", {"message": new_message, "username": display_name, "channel": channel_name});
            return false;
        };
    });

    // When a new message is announced, add it to the unordered list
    socket.on("announce message", data => {
        if (data.channel == channel_name){
            displayMessage(data);
            scroll();
        }
    });

    function checkCustomValidity() {
        var input_field = this;
        var if_value = input_field.value

        var valid_letters = /^[a-zA-Z0-9 _-]+$/;
        var invalid_start = /^[ _-]/;
        var invalid_end = /[ _-]$/;

        if (if_value.length > 16) {
            input_field.setCustomValidity("Too long. Can't be longer than 16 characters.");
        } else if (if_value.length < 4) {
            input_field.setCustomValidity("Too short. Needs to be at least 4 characters.");          
        } else if (!valid_letters.test(if_value)) {
            input_field.setCustomValidity("Invalid character. Display name must be alphanumeric.");
        } else if (invalid_start.test(if_value)) {
            input_field.setCustomValidity("Invalid start character. First character must be letter or number.");
        } else if (invalid_end.test(if_value)) {
            input_field.setCustomValidity("Invalid end character. Last character must be letter or number.");
        } else {
            input_field.setCustomValidity("");
        }
        this.parentElement.getElementsByClassName("invalid-feedback")[0].innerHTML = input_field.validationMessage;
        // document.getElementById("dn_invalid_feedback").innerHTML = input_field.validationMessage;
        return;
    }
    
    document.getElementById("new_display_name").oninput = checkCustomValidity;
    document.getElementById("new_channel").oninput = checkCustomValidity;
    
    // List old messages
    for (const message of old_messages) {
        displayMessage(message);
    }

    document.getElementById("middle").onscroll = onScroll;
    scroll()
})

// Ref: https://stackoverflow.com/questions/11120840/hash-string-into-rgb-color
function djb2(str){
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return Math.abs(hash);
  }

//const colours = ["#E27D60", "#85CDCA", "#E8A87C", "#C38D9E", "#41B3A3"];

// Fontawesome colours: pink, orange, green, cyan, blue, purple
const colours = ["#f783ac", "#fd7d14", "#82c91e", "#15abbf", "#4c6ef5", "#be4bdb"]

function calculateColour(str){
    const hash = djb2(str);
    const index = hash % colours.length;
    return colours[index];
};

var latest_date = null;

function displayMessage(data) {
    // const date = data.timestamp.slice(0,10)
    const date = data.date
    if (date != latest_date){
        const date_content = date_line({"date": date})
        const date_li = document.createElement("li");
        date_li.innerHTML = date_content;
        document.querySelector("#messages").append(date_li);

        latest_date = date;
    }
    
    const colour = calculateColour(data.username);
    const message_content = message_line({"time": data.time, "username": data.username, "message_text": data.message, "colour": colour});
    const message_li = document.createElement("li");
    message_li.innerHTML = message_content;
    document.querySelector("#messages").append(message_li);
}

// Stay scrolled to bottom
// Ref: https://stackoverflow.com/questions/270612/scroll-to-bottom-of-div?rq=1
var scrolled = true;

function scroll() {
    if (scrolled) {
        var middle = document.getElementById("middle");
        middle.scrollTop = middle.scrollHeight;
    } else {
        $("#more_messages_popover").popover('show')
        // Hide popup when click anywhere else
        // Ref. https://stackoverflow.com/questions/11703093/how-to-dismiss-a-twitter-bootstrap-popover-by-clicking-outside
        $("html").on("mouseup", function (e) {
            var l = $(e.target);
            if (l[0].className.indexOf("popover") == -1) {
                $(".popover").each(function () {
                    $(this).popover("hide");
                });
            }
        });
        document.querySelector(".popover-header").onclick = () => {
            scrolled = true;
            scroll();
            $("#more_messages_popover").popover('hide')
        }
    }
}

function onScroll() {
    var middle = document.getElementById("middle");
    if ((middle.scrollTop + middle.clientHeight) >= middle.scrollHeight - 15) {
        scrolled = true;
        $("#more_messages_popover").popover('hide')
    } else {
        scrolled = false;
    }
}