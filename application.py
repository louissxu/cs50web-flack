import os

from flask import Flask
from flask_socketio import SocketIO, emit

from flask import render_template

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")
