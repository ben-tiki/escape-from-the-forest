# Escape from the Forest Text Adventure Game

Welcome to the thrilling Escape from the Forest Adventure Game! This text-based adventure game is inspired by a short skit from the Rick and Morty show, and uses OpenAI's GPT-4 to handle the game flow and game states. The game has the look and appearance of an old-school computer terminal, and the objective is to escape a dangerous forest filled with creatures such as vampires, hunters, and creatures.

<p align="center">
  <video src="https://user-images.githubusercontent.com/101474762/229404749-1a1879dc-8896-43de-8f6e-31aaf07795a1.mp4" controls></video>
</p>

## Features

- AI-powered game flow and game states using OpenAI GPT-4 and GPT-3-turbo
- Old-school computer terminal appearance
- Text-based adventure inspired by Rick and Morty

## Technology Stack

This text adventure game is built using the following technologies:

- **Flask**: A lightweight Python web framework used to create the backend server and handle HTTP requests and responses.  Visit the [Flask website](https://flask.palletsprojects.com/)
- **Plain CSS**: Used for styling the game's user interface, including the terminal appearance and text formatting.
- **JavaScript**: Used for handling user input, terminal interactions, and making asynchronous requests to the Flask server.
- **OpenAI GPT-4 and GPT-3-turbo**: AI models used to handle the game flow and game states, providing dynamic and engaging gameplay.

## Installation

Make sure to have Python installed on your machine. You can download Python from [here](https://www.python.org/downloads/).

To run the game locally, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/ben-tiki/escape-from-the-forest.git
```

2. Change to the project directory:

```bash
cd escape-from-the-forest
```

3. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate (Linux/macOS)
venv\Scripts\activate (Windows)
```

4. Install the required dependencies:

```bash
pip install -r requirements.txt
```

5. Crate a `.env` file in the root directory and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key
```

6. Run the game:

```bash
python app.py
```

7. Open your web browser and navigate to `http://127.0.0.1:5000/` to start playing the game.

## How to Play

- Type `help` for a list of available commands.
- Type `start` to dive into the game.
- Enter your command and press `enter` to execute the command.
- Be cautious and make wise decisions to escape the forest.
- If you are having performance issues, you can change the GAME_MODEL from gpt-4 to gpt-3-turbo in the config.py file.

## Contributing

Feel free to contribute to this project by submitting issues, pull requests, or providing feedback on the game experience.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
