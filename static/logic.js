document.addEventListener("DOMContentLoaded", function () {

    const input = document.getElementById("input");
    const chatbox = document.getElementById("chatbox");
    const inputArea = document.getElementById("inputArea");

    window.sendMessage = async function () {
        let message = input.value.trim();

        if (!message) return;

        // ✅ Move input box to bottom
        inputArea.classList.remove("center");
        inputArea.classList.add("bottom");

        // ✅ Show user message
        const userMsg = document.createElement("div");
        userMsg.classList.add("message", "user");
        userMsg.innerText = message;
        chatbox.appendChild(userMsg);

        input.value = "";
        chatbox.scrollTo({
            top: chatbox.scrollHeight,
            behavior: "smooth"
        });

        try {
            // ✅ API call
            let response = await fetch(`/chat?prompt=${encodeURIComponent(message)}`, {
                credentials: "same-origin"
            });
            let data = await response.json();

            let reply = data.reply || data.error || "Error";

            // ✅ Show bot reply
            const botMsg = document.createElement("div");
            botMsg.classList.add("message", "bot");
            botMsg.innerHTML = formatMessage(reply);
            chatbox.appendChild(botMsg);
            // 🔥 scroll after reply
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: "smooth"
            });

        } catch (err) {
            const errorMsg = document.createElement("div");
            errorMsg.classList.add("message", "bot");
            errorMsg.innerText = "❌ Server error";
            chatbox.appendChild(errorMsg);
            // 🔥 scroll after error too
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: "smooth"
            });
        }
    };
    // ✅ Enter key support
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    });





    function formatMessage(text) {
        return text.replace(/```(\w+)?\n([\s\S]*?)```/g, function (_, lang, code) {
            return `
            <div class="code-block">
                <div class="code-header">
                    <span>${lang || "code"}</span>
                    <button onclick="copyCode(this)">Copy</button>
                </div>
                <pre><code>${escapeHtml(code)}</code></pre>
            </div>
            `;
        }).replace(/\n/g, "<br>");
    }
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }
    function copyCode(btn) {
        const code = btn.parentElement.nextElementSibling.innerText;
        navigator.clipboard.writeText(code);
        
        btn.innerText = "Copied!";
        setTimeout(() => btn.innerText = "Copy", 1500);
    }
    window.copyCode = copyCode;

});