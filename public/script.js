document.getElementById("user-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

document.getElementById("send-btn").addEventListener("click", () => {
    sendMessage();
});

function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() !== "") {
        displayMessage("American", userInput);
        document.getElementById("user-input").value = "";

        fetchChatGPTResponse(userInput).then((response) => {
            displayMessage("Ling Ling Language Model", response);
        });
    }
}

function displayMessage(sender, message) {
    const chatDisplay = document.getElementById("chat-display");
    const messageElement = document.createElement("div");
    sender = sender === "DLM" ? "Ling Ling Language Model" : sender;
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatDisplay.appendChild(messageElement);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

async function fetchChatGPTResponse(userInput) {
    try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: userInput })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return 'Try again gringo';
    }
}