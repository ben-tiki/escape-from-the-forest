import logging

from flask import Flask, render_template, request, jsonify

from config import GAME_SYSTEM_MESSAGE, STATUS_SYSTEM_MESSAGE, MAX_TOKENS
from config import GAME_MODEL, STATUS_MODEL

from modules.openai_api import get_answer, categorize_answer
from modules.open_ai_utils import truncate_conversation
from modules.text_formatter import format_text

app = Flask(__name__)

# set up logging
logging.basicConfig(level=logging.INFO)

# save messages to a list
message_history = [
    {"role": "system", "content": GAME_SYSTEM_MESSAGE},
]


@app.route("/")
def dashboard():
    """
    Return the terminal page with the game.
    GET request: Render the terminal page.
    POST request: Process user input and return an answer and status as JSON.
    """

    return render_template("menu.html")


@app.route("/terminal", methods=["GET", "POST"])
def terminal():
    """Return the terminal page with the game."""

    global message_history

    if request.method == "GET":

        # reset message history on page reload
        message_history = [
            {"role": "system", "content": GAME_SYSTEM_MESSAGE},
        ]
        return render_template("terminal.html")
    else:
        try:
            data = request.get_json()
            command = data["message"]
        except (KeyError, TypeError):
            logging.error(f"Invalid JSON data: {request.data}")
            return jsonify({"error": "Invalid JSON data"}), 400

        message_history.append({"role": "user", "content": command})
        message_history = truncate_conversation(
            message_history, MAX_TOKENS)  # truncate if tokens exceed max

        answer = format_text(get_answer(message_history, GAME_MODEL))
        message_history.append({"role": "assistant", "content": answer})

        status = categorize_answer(STATUS_SYSTEM_MESSAGE, answer, STATUS_MODEL)
        print(status)

        return jsonify({"answer": answer, "status": status})


if __name__ == "__main__":
    app.run(debug=True)
