import os
import requests

from flask import Flask
from flask_socketio import SocketIO, emit

from flask import render_template, request, flash, redirect, url_for

import string
import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

allowed_channel_characters = string.ascii_letters + string.digits + "_-"
allowed_display_name_characters = string.ascii_letters + string.digits + "_-"

# TODO
# verify server side validation matches client side
# index page overlay
# clean code
# more formatting of messages
# refactor classes
# host on heroku
# change timeout time?

# Improvements
# Make socket.io broadcast to only that channel rather than all and client side filter out irrelevant channels
# Add client side validation of display name, channel name, message

class Channel():
    def __init__(self, name):
        self.name = name
        self.messages = []
        self.pruned = False;
    def __eq__(self, other):
        return self.name == other.name
    def add_message(self, username, message, date=None, time=None):
        self.messages.append(Message(username,message,date,time))
        while len(self.messages) > 100:
            self.messages.pop(0)
            self.pruned = True;
    def previous_messages(self):
        return [{"date": message.date, "time": message.time, "username": message.username, "message": message.message} for message in self.messages]

class Message():
    def __init__(self, username, message, date=None, time=None):
        if any([not date, not time]):
            now = datetime.datetime.now()
            date = now.strftime("%Y-%m-%d")
            time = now.strftime("%H:%M:%S")
        self.date = date
        self.time = time
        self.message = message
        self.username = username
    def __str__(self):
        pass

channels = [
    Channel("general"),
    Channel("random_channel"),
    Channel("fun_stuff"),
]

now = datetime.datetime.now()
todays_date = now.strftime("%Y-%m-%d")
yesterday_date = (now + datetime.timedelta(days=-1)).strftime("%Y-%m-%d")
earlier_time = (now + datetime.timedelta(hours=-1)).strftime("%H:%M:%S")
even_earlier_time = (now + datetime.timedelta(hours=-3)).strftime("%H:%M:%S")

channels[0].add_message("Alice", "Check this out!", date=yesterday_date, time=even_earlier_time)
channels[0].add_message("Bob", "That's pretty cool!", date=yesterday_date, time=even_earlier_time)
channels[0].add_message("Charles", "Did you know you can change your display name and channel?", date=todays_date, time=earlier_time)
channels[0].add_message("Alice", "And make new channels! All in that left sidebar over there.", date=todays_date, time=earlier_time)
channels[0].add_message("Bob", "Awesome! I'll have to check it out.", date=todays_date, time=earlier_time)

channels[1].add_message("Louis Xu", "Built using Flask and Societ.IO")
channels[1].add_message("Louis Xu", "For CS50 Web - 2020-03-31")
channels[1].add_message("Louis Xu", "See github page for full specifications")

# channels[1].add_message("", "")
# channels[1].add_message("Display Name", "When a user visits your web application for the first time, they should be prompted to type in a display name that will eventually be associated with every message the user sends. If a user closes the page and returns to your app later, the display name should still be remembered.")
# channels[1].add_message("", "")
# channels[1].add_message("Channel Creation", "Any user should be able to create a new channel, so long as its name doesn’t conflict with the name of an existing channel.")
# channels[1].add_message("", "")
# channels[1].add_message("Channel List", "Users should be able to see a list of all current channels, and selecting one should allow the user to view the channel. We leave it to you to decide how to display such a list.")
# channels[1].add_message("", "")
# channels[1].add_message("Messages View", "Once a channel is selected, the user should see any messages that have already been sent in that channel, up to a maximum of 100 messages. Your app should only store the 100 most recent messages per channel in server-side memory.")
# channels[1].add_message("", "")
# channels[1].add_message("Sending Messages", "Once in a channel, users should be able to send text messages to others the channel. When a user sends a message, their display name and the timestamp of the message should be associated with the message. All users in the channel should then see the new message (with display name and timestamp) appear on their channel page. Sending and receiving messages should NOT require reloading the page.")
# channels[1].add_message("", "")
# channels[1].add_message("Remembering the Channel", "If a user is on a channel page, closes the web browser window, and goes back to your web application, your application should remember what channel the user was on previously and take the user back to that channel.")
# channels[1].add_message("", "")
# channels[1].add_message("Notes", "Don't use SQL for the database. Should be stored in temporary server side memory. Refreshes when webserver restarts after inactivity.")

channels[2].add_message("Alice", "Hey guys! I heard a great joke.")
channels[2].add_message("Bob", "Okay great, what is it?")
channels[2].add_message("Alice", "It's a 'knock knock' joke. But you have to start it.")
channels[2].add_message("Bob", "Okay. Knock knock.")
channels[2].add_message("Alice", "Who's there?")
channels[2].add_message("Charles", "...")
channels[2].add_message("Charles", "I can't believe you fell for that Bob >_<")

@app.route("/")
def index():
    return render_template("index.html.jinja2", channels=[{"name": channel.name, "url": url_for("channel_page", channel_name=channel.name)} for channel in channels])
    # return redirect(url_for("channel_page", channel_name="general"))

@app.route("/channel/<channel_name>/", methods=["GET"])
def channel_page(channel_name):
    '''Return channel page on GET.'''

    # Render channel page if GET
    if request.method == "GET":
        if Channel(channel_name) not in channels:
            flash(f"Channel '{channel_name}' does not exist. Please create channel first", "primary")
            return redirect(url_for("index"))
        channels_data = [{"name": channel.name, "url": url_for("channel_page", channel_name=channel.name)} for channel in channels]
        messages_pruned = False
        for c in (d for d in channels if d.name == channel_name):
            channel_messages = c.previous_messages()
            if c.pruned == True:
                messages_pruned = True
        return render_template("index.html.jinja2", channels=[{"name": channel.name, "url": url_for("channel_page", channel_name=channel.name)} for channel in channels], channel_name=channel_name, channel_messages=channel_messages, messages_pruned=messages_pruned)
        # return render_template("index.html.jinja2", channels=channels_data, channel_name=channel_name, channel_messages=channel_messages)

@app.route("/channel/", methods=["GET", "POST"])
def channel():
    '''Make new channel on successful POST.'''

    # Redirect to index if GET
    if request.method == "GET":
        return redirect(url_for("index"))

    # Create channel if POST
    else:

        new_channel = request.form.get("new_channel")
        # new_channel = new_channel.lower()

        new_channel = new_channel.lower()
        new_channel = new_channel.replace(" ", "_")

        if Channel(new_channel) in channels:
            flash(f"Channel '{new_channel}' already exists. Redirecting you there.", "info")
            return redirect(url_for("channel_page", channel_name=new_channel))
 
        if len(new_channel) < 4:
            flash("Channel name is too short. Please try again.", "primary")
            return redirect(url_for("index"))

        if len(new_channel) > 16:
            flash("Channel name is too long. Please try again.", "primary")
            return redirect(url_for("index"))

        for c in new_channel:
            if c not in allowed_channel_characters:
                flash(f"Invalid character in channel name. Please try again.", "primary")
                return redirect(url_for("index"))

        if c[0] in " -_":
            flash("Invalid first character. Channel name must start with letter or number.", "primary")
            return redirect(url_for("index"))

        if c[-1] in " -_":
            flash("Invalid last character. Channel name must end with letter or number.", "primary")
            return redirect(url_for("index"))

        # Passes above back-end validity checks  Improvement: need to also do the same checks client-side
        channels.append(Channel(new_channel))

        return redirect(url_for("channel_page", channel_name=new_channel))

@socketio.on("submit message")
def message(data):

    message = data.get("message", None)
    username = data.get("username", None)
    channel = data.get("channel", None)

    # if not message:  Removed. Allow empty messages.
    #     return

    if not username or not channel:
        return

    if 4 > len(username) > 16:
        return

    for c in username:
        if c not in allowed_display_name_characters:
            return
    
    if username[0] in " _-":
        return

    if username[-1] in " _-":
        return

    for c in (d for d in channels if d.name == channel):
        c.add_message(username, message)
    now = datetime.datetime.now()
    date = now.strftime("%Y-%m-%d")
    time = now.strftime("%H:%M:%S")

    emit("announce message", {"message": message, "username": username, "date": date, "time": time, "channel": channel}, broadcast=True)

# @app.route("/test/")
# def test():
#     return render_template("test.html.jinja2")