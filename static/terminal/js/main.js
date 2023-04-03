import { BANNER, HELP, START, SOURCE, CONTROLS, INFO } from "./commands.js";
import { playerLost, playerWon } from "./game.js";

// SELECT HTML ELEMENTS
// ---------------------------------------
export const beforeDiv = document.getElementById("before-div"),
    currentCommandLine = document.getElementById("current-command-line"),
    commandText = document.getElementById("commad-written-text"),
    userTextInput = document.getElementById("user-text-input");

const typingSound = new Audio();
typingSound.src = document.getElementById("typing-sound").src;
typingSound.loop = true;

// COMMANDER VARIABLES
// ---------------------------------------
let currentCommand = 0,
    commandHistory = [],
    typingSpeed = 10,
    typing = true,
    playAudio = false,
    fetchingResponse = false,
    gameStarted = false,
    gameEnded = false;

export const startCommander = () => {
    userTextInput.value = "";
    commandText.innerHTML = userTextInput.value;

    displayLinesInTerminal({ lines: BANNER });
    userTextInput.focus();
};

// HTTP REQUESTS
// ---------------------------------------
async function postMessageServer() {
    fetchingResponse = true;

    // prepare the request data
    const requestData = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: commandHistory[commandHistory.length - 1],
        }),
    };

    // add loading dots animation
    displayLineInTerminal({ style: "loading" });

    try {
        // send the request using fetch
        const response = await fetch("/terminal", requestData);

        // check if the response is OK (status code in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // process the response
        const jsonResponse = await response.json();
        const openApiResponse = jsonResponse["answer"];

        // split the response into lines based on punctuation
        const responseLines = openApiResponse.split(/(?<=[.?!])\s+/g);
        let lines = responseLines.map((line) => line);

        // remove loading dots animation and add response lines
        let loading = document.getElementsByClassName("loading");
        loading[0].remove();

        await displayLinesInTerminal({ lines: lines });

        // indicate that the response has been fetched
        fetchingResponse = false;

        // check if the game has ended (possible responses: DEAD, WON, UNKNOWN)
        switch (jsonResponse.status) {
            case "DEAD":
                playerLost();
                gameEnded = true;
                break;
            case "WON":
                playerWon();
                gameEnded = true;
                break;
            default:
                // do nothing
                break;
        }
    } catch (error) {
        console.error("Error:", error);
        fetchingResponse = false;
        let loading = document.getElementsByClassName("loading");
        loading[0].remove();
        displayLineInTerminal({
            text: "An error occurred while processing your request. Please try again later.",
            style: "error",
        });
    }
}

// TEXT FUNCTIONS
// ---------------------------------------
const typeText = async (element, text) => {
    if (playAudio && typingSound.paused) {
        typingSound.play();
    }

    for (let i = 0; i < text.length; i++) {
        if (text.charAt(i) === " " && text.charAt(i + 1) === " ") {
            element.innerHTML += "&nbsp;&nbsp;";
            i++;
        } else {
            element.innerHTML += text.charAt(i);
        }
        await new Promise((resolve) => setTimeout(resolve, typingSpeed));
    }

    if (playAudio) {
        typingSound.pause();
        typingSound.currentTime = 0;
    }
};

const createNewLineElement = ({ style = "", addPadding = false }) => {
    // remove the current command line until new line is displayed
    currentCommandLine.classList.remove("visible");
    currentCommandLine.style.opacity = 0;

    const nextLine = document.createElement("p");

    // add style depending on the type of line
    nextLine.className = style + (addPadding ? " spaced-line" : "");

    beforeDiv.parentNode.insertBefore(nextLine, beforeDiv);
    window.scrollTo(0, document.body.offsetHeight);

    return nextLine;
};

// process remaining text with styled and unstyled parts and apply typing effect
const processTextWithTypingEffect = async (nextLine, text) => {
    let remainingText = text;

    // process remaining text with styled and unstyled parts
    while (remainingText) {
        const styledElementMatch = remainingText.match(/<(\w+)(?:\s+class=['"]([^'"]*)['"])?>([^<]*)<\/\1>/);
        const unstyledText = styledElementMatch ? remainingText.slice(0, styledElementMatch.index) : remainingText;

        // handle unstyled text
        if (unstyledText) {
            await typeText(nextLine, unstyledText);
        }

        // handle styled text
        if (styledElementMatch) {
            const [, tagName, className, innerText] = styledElementMatch;
            const styledElement = document.createElement(tagName);
            if (className) {
                styledElement.className = className;
            }
            nextLine.appendChild(styledElement);
            await typeText(styledElement, innerText);
            remainingText = remainingText.slice(styledElementMatch.index + styledElementMatch[0].length);
        } else {
            remainingText = null;
        }
    }
};

// display a line in the terminal with optional styling and typing effect
export const displayLineInTerminal = async ({ text = "", style = "", useTypingEffect = true, addPadding = false }) => {
    typing = true;

    // create and style a new line element
    const nextLine = createNewLineElement({ style, addPadding });

    // use typing effect if enabled
    if (useTypingEffect) {
        await processTextWithTypingEffect(nextLine, text);
    } else {
        // insert text without typing effect
        nextLine.innerHTML = text;
    }

    // reset typing flag and make the current command line visible
    typing = false;
    currentCommandLine.style.opacity = 1;
    currentCommandLine.classList.add("visible");
};

// display multiple lines in the terminal with optional styling and typing effect
export const displayLinesInTerminal = async ({ lines, style = "", useTypingEffect = true }) => {
    for (let i = 0; i < lines.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        await displayLineInTerminal({ text: lines[i], style: style, useTypingEffect: useTypingEffect });
    }
};

// EVENT LISTENERS
// ---------------------------------------
// user input keydown event listener
const keyBindings = {
    Enter: () => {
        // if a response is being fetched, do nothing on Enter
        if (fetchingResponse) {
            return;
        } else {
            commandHistory.push(commandText.innerHTML);
            currentCommand = commandHistory.length;
            displayLineInTerminal({ text: `>> ${commandText.innerHTML}`, useTypingEffect: false, addPadding: true });
            commander(commandText.innerHTML.toLowerCase());
            commandText.innerHTML = "";
            userTextInput.value = "";
        }
    },

    ArrowUp: () => {
        if (currentCommand > 0) {
            currentCommand -= 1;
            commandText.innerHTML = commandHistory[currentCommand];
            userTextInput.value = commandHistory[currentCommand];
        }
    },

    ArrowDown: () => {
        if (currentCommand < commandHistory.length) {
            currentCommand += 1;
            if (commandHistory[currentCommand] === undefined) {
                userTextInput.value = "";
            } else {
                userTextInput.value = commandHistory[currentCommand];
            }
            commandText.innerHTML = userTextInput.value;
        }
    },
};

// available user commands
export const commandBindings = {
    help: () => {
        displayLinesInTerminal({ lines: HELP });
    },

    start: () => {
        displayLineInTerminal({ text: START });
        gameStarted = true;
    },

    history: () => {
        displayLinesInTerminal({ lines: commandHistory });
    },

    clear: () => {
        while (beforeDiv.previousSibling) {
            beforeDiv.previousSibling.remove();
        }
    },

    audio: () => {
        if (playAudio) {
            playAudio = false;
            displayLineInTerminal({ text: "Audio turned off" });
        } else {
            playAudio = true;
            displayLineInTerminal({ text: "Audio turned on" });
        }
    },

    restart: () => {
        let count = 6;

        function updateCounter() {
            count--;

            if (count <= 0) {
                clearInterval(counter);
                return location.reload();
            }

            displayLineInTerminal({
                text: `Game will restart in ${count}...`,
                style: status,
                useTypingEffect: true,
                addPadding: false,
            });
        }

        // execute the code block immediately before starting the interval
        updateCounter();

        let counter = setInterval(updateCounter, 1000);
    },

    banner: () => {
        displayLinesInTerminal({ lines: BANNER });
    },

    info: () => {
        displayLinesInTerminal({ lines: INFO });
    },

    source: () => {
        displayLinesInTerminal({ lines: SOURCE });
    },

    controls: () => {
        displayLinesInTerminal({ lines: CONTROLS });
    },

    save: () => {
        const content = document.body.innerText;

        const trimmedContent = content.replace(/(\r\n|\n|\r){3,}/gm, "\n");

        function download(content, fileName, contentType) {
            const a = document.createElement("a");
            const file = new Blob([content], { type: contentType });
            a.href = URL.createObjectURL(file);
            a.download = fileName;
            a.click();
        }
        download(trimmedContent, "terminal_game.txt", "text/plain");

        displayLineInTerminal({ text: "Saved terminal game to file" });
    },
};

// keyup event listener
export const enterKey = (event) => {
    if (!typing) {
        if (event.key in keyBindings) {
            keyBindings[event.key]();
            event.preventDefault();
        } else {
            commandText.innerHTML = userTextInput.value;
        }
    }
};

// command handler
const commander = (commandText) => {
    const cleanCommand = commandText.toLowerCase().trim();

    // Possible states:
    // 1. game has not started (gameStarted = false)
    // 2. game is in progress (gameStarted = true, gameEnded = false)
    // 3. game has ended (gameStarted = true, gameEnded = true)

    if (cleanCommand in commandBindings) {
        if (!gameStarted) {
            // game has not started
            commandBindings[cleanCommand]();
        } else if (gameStarted && !gameEnded) {
            // game is in progress
            commandBindings[cleanCommand]();
        } else {
            // game has ended
            if (cleanCommand === "restart" || cleanCommand !== "start") {
                commandBindings[cleanCommand]();
            } else {
                displayEndGameMessage();
            }
        }
    } else {
        if (gameStarted && !gameEnded) {
            postMessageServer();
        } else if (gameEnded) {
            displayEndGameMessage();
        } else {
            displayLineInTerminal({
                text: `'${cleanCommand}' command not found. For a list of commands, type '<span class="command">help</span>'`,
                useTypingEffect: true,
            });
        }
    }
};

const displayEndGameMessage = () => {
    displayLineInTerminal({
        text: "The game has ended. Please type <span class='command'>restart</span> to start a new game or <span class='command'>help</span> for a list of commands.",
        useTypingEffect: true,
    });
};
