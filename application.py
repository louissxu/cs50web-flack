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

# TODO
# autoscroll
# random accent colour
# client side vaidation on/off
# verify server side validation matches client side
# index page overlay
# clean code
# more formatting of messages
# validation of messages. (mostly non-zero)
# refactor classes
# host on heroku

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
    def add_message(self, username, message, timestamp=None):
        self.messages.append(Message(username,message,timestamp))
        while len(self.messages) > 100:
            self.messages.pop(0)
            self.pruned = True;
    def previous_messages(self):
        return [{"timestamp": message.timestamp, "username": message.username, "message": message.message} for message in self.messages]

channels = [
    Channel("random_channel"),
    Channel("fun_stuff"),
    Channel("channel_for_bananas")
]

class Message():
    def __init__(self, username, message, timestamp=None):
        if not timestamp:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.timestamp = timestamp
        self.message = message
        self.username = username
    def __str__(self):
        pass


@app.route("/")
def index():
    return render_template("index.html.jinja2", channels=[{"name": channel.name, "url": url_for("channel_page", channel_name=channel.name)} for channel in channels])


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

    message = data.get("message",None)
    username = data.get("username", None)
    channel = data.get("channel", None)

    if not message or not username or not channel:
        return

    for c in (d for d in channels if d.name == channel):
        c.add_message(username, message)
    now = datetime.datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
    emit("announce message", {"message": message, "username": username, "timestamp": timestamp, "channel": channel}, broadcast=True)

# @app.route("/test/")
# def test():
#     return render_template("test.html.jinja2")