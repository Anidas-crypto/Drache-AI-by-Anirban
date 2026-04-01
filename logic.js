async function sendMessage() {
    let input = document.getElementById("input");
    let message = input.value;
    if (!message) return;
    let chatbox = document.getElementById("chatbox");
    // User message
    chatbox.innerHTML += `<div class="message user">${message}</div>`;
    input.value = "";
    chatbox.scrollTop = chatbox.scrollHeight;
    let response = await fetch(`/chat?prompt=${encodeURIComponent(message)}`);
    let data = await response.json();
    // Bot message
    let reply = typeof data === "string" ? data : data.error || JSON.stringify(data);
    chatbox.innerHTML += `<div class="message bot">${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
}
