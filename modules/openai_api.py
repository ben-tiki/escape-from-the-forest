import openai

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")


def get_answer(messages: list, model: str) -> str:
    """Returns the model response to game messages."""

    response = openai.ChatCompletion.create(
        model=model,
        messages=messages
    )

    return response["choices"][0]["message"]["content"]


def categorize_answer(categories: str, response: str, model:str) -> str:
    """Returns the model response to game messages."""

    status = openai.ChatCompletion.create(
        model=model,
        messages=[
            {"role": "system", "content": "{categories}".format(categories=categories)},
            {"role": "user", "content": "{prompt}".format(prompt=response)},
        ]
    )

    return status["choices"][0]["message"]["content"]
