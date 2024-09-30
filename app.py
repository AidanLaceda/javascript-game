from flask import Flask, render_template, request, url_for
from database import get_db, close_db


app = Flask(__name__)
app.teardown_appcontext(close_db)

@app.route("/")
def index():
    return render_template("index.html", title="Menu")

@app.route("/game")
def game():
    return render_template("game.html")

@app.route("/leaderboard")
def leaderboard():
    db = get_db()
    leaderboard = db.execute("""SELECT * FROM leaderboard""").fetchall()
    return render_template("leaderboard.html", title="Leaderboard", leaderboard=leaderboard)

@app.route("/store_score", methods=["POST"])
def store_score():
    score = int(request.form["score"])
    db = get_db()
    db.execute("""INSERT INTO leaderboard (score)
                VALUES (?);""", (score,))
    db.commit()
    return "success"
