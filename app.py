from flask import Flask, render_template, request, url_for

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html", title="Menu")

@app.route("/game")
def game():
    return render_template("game.html")
