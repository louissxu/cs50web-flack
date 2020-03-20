import os

from flask import Flask
from flask_socketio import SocketIO, emit

from flask import render_template, request, flash, redirect, url_for

import string

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


channels = ["random_channel", "fun_stuff", "channel_for_bananas"]
allowed_channel_characters = string.ascii_letters + string.digits + "_-"

@app.route("/")
def index():
    return render_template("index.html.jinja2", channels=channels)


@app.route("/channel/<channel_name>/", methods=["GET"])
def channel_page(channel_name):
    '''Return channel page on GET.'''

    # Render channel page if GET
    if request.method == "GET":
        if channel_name not in channels:
            flash(f"Channel '{channel_name}' does not exist. Please create channel first")
            return redirect(url_for("index"))
        return render_template("index.html.jinja2", channels=channels, channel_name=channel_name)

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

        if new_channel in channels:
            flash(f"Channel '{new_channel}' already exists. Redirecting you there")
            return redirect(url_for("channel_page", channel_name=new_channel))
 
        if len(new_channel) < 4:
            flash("Channel name is too short. Please try again")
            return redirect(url_for("index"))

        # Passes above back end validity checks  Improvement: need to also do client side same checks
        channels.append(new_channel)

        return redirect(url_for("channel_page", channel_name=new_channel))