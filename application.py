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

# Improvements
# Make socket.io broadcast to only that channel rather than all and client side filter out irrelevant channels

class Channel():
    def __init__(self, name):
        self.name = name
        self.messages = []
    def __eq__(self, other):
        return self.name == other.name
    def add_message(self, username, message, timestamp=None):
        self.messages.append(Message(username,message,timestamp))
        while len(self.messages) > 100:
            self.messages.pop(0)
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
            flash(f"Channel '{channel_name}' does not exist. Please create channel first")
            return redirect(url_for("index"))
        channels_data = [{"name": channel.name, "url": url_for("channel_page", channel_name=channel.name)} for channel in channels]
        for c in (d for d in channels if d.name == channel_name):
            channel_messages = c.previous_messages()
        return render_template("index.html.jinja2", channels=channels_data, channel_name=channel_name, channel_messages=channel_messages)

@app.route("/channel/", methods=["POST"])
def channel():
    '''Make new channel on successful POST.'''

    # Create channel if POST
    if request.method == "POST":

        new_channel = request.form.get("new_channel")
        # new_channel = new_channel.lower()

        for c in new_channel:
            if c not in allowed_channel_characters:
                flash(f"Invalid character in channel name. Please try again")
                return redirect(url_for("index"))

        if Channel(new_channel) in channels:
            flash(f"Channel '{new_channel}' already exists. Redirecting you there")
            return redirect(url_for("channel_page", channel_name=new_channel))
 
        if len(new_channel) < 4:
            flash("Channel name is too short. Please try again")
            return redirect(url_for("index"))

        # Passes above back-end validity checks  Improvement: need to also do the same checks client-side
        channels.append(Channel(new_channel))

        return redirect(url_for("channel_page", channel_name=new_channel))

@socketio.on("submit message")
def message(data):
    message = data["message"]
    username = data["username"]
    channel = data["channel"]
    for c in (d for d in channels if d.name == channel):
        c.add_message(username, message)
    now = datetime.datetime.now()
    timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
    emit("announce message", {"message": message, "username": username, "timestamp": timestamp, "channel": channel}, broadcast=True)