document.addEventListener("DOMContentLoaded", () => {
    var display_name = null;

    if (localStorage.getItem("display_name") != null) {
        display_name = localStorage.getItem("display_name");
        document.querySelector("#display_name").innerHTML = display_name;
    }

    document.querySelector("#change_display_name").onsubmit = () => {
        display_name = document.querySelector("#new_display_name").value;
        localStorage.setItem("display_name", display_name);

        document.querySelector("#display_name").innerHTML = display_name;
        document.querySelector("#new_display_name").value = "";
        
        return false;
    };
})
