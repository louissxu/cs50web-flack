# Flack

A simple clone of Slack. Built with Python, Flask, Socket.IO and JS. [Hosted on Heroku here.](https://fierce-headland-38432.herokuapp.com/)\
Dyno restarts after period of inactivity and loses saved state. State populated on server start with dummy channel names and a little bit of chatter.

As per project hints. No SQL database used. Therefore:
* Display name and last channel visited stored client side.
* No verification of display name colision etc done server side.
* Messages and channel name(s) stored temporarily in server side memory whichg ets reset on restart of flask server.

### CS50Web - Project 2
An online messaging service built using flask similar in spirit to Slack.\
Built for CS50 web. See [project requirements.](https://docs.cs50.net/ocw/web/projects/2/project2.html)

### Specifications
* Display Name: When a user visits your web application for the first time, they should be prompted to type in a display name that will eventually be associated with every message the user sends. If a user closes the page and returns to your app later, the display name should still be remembered.
* Channel Creation: Any user should be able to create a new channel, so long as its name doesn’t conflict with the name of an existing channel.
* Channel List: Users should be able to see a list of all current channels, and selecting one should allow the user to view the channel. We leave it to you to decide how to display such a list.
Messages View: Once a channel is selected, the user should see any messages that have already been sent in that channel, up to a maximum of 100 messages. Your app should only store the 100 most recent messages per channel in server-side memory.
* Sending Messages: Once in a channel, users should be able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message should be associated with the message. All users in the channel should then see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages should NOT require reloading the page.
* Remembering the Channel: If a user is on a channel page, closes the web browser window, and goes back to your web application, your application should remember what channel the user was on previously and take the user back to that channel.
* Personal Touch: Add at least one additional feature to your chat application of your choosing!
    * Autoscroll using JS and prompt when new message appears when not scrolled to bottom using bootstrap popup.
    * Algorithmic display name colour.
    * Custom client-side validation of display name and channel name using JS validation and bootstrap.