
// const template = Handlebars.compile(document.querySelector("#result").innerHTML);
// // const template=Handlebars.compile("Handlebars: {{value}}")

// document.addEventListener("DOMContentLoaded", () => {
//     document.querySelector("#roll").onclick = () => {
        
//         const roll = Math.floor((Math.random() * 6) +1);
//         console.log(roll);
//         const content = template({"value": roll});

//         console.log(content)
//         document.querySelector("#rolls").innerHTML += content;
//     }
// });


            // Template for roll results
            const template = Handlebars.compile(document.querySelector("#result").innerHTML);
            // const template = Handlebars.compile("<li>You rolled a {{value}}</li>");

            document.addEventListener('DOMContentLoaded', () => {
                document.querySelector('#roll').onclick = ()  => {

                    // Generate a random roll.
                    const roll = Math.floor((Math.random() * 6) + 1);
                    console.log(roll);
                    // Add roll result to DOM.
                    const content = template({'value': roll});
                    console.log(content);
                    document.querySelector('#rolls').innerHTML += content;
                };
            });