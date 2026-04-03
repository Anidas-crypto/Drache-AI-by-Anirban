const supabaseUrl = "https://zhrjmnrfklzuxmfbdqhg.supabase.co";
const supabaseKey = "sb_publishable_aIbByN1rFc9V3AH41Kyz6A_e1XppA1Z";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", function () {

    // ✅ FIX: define elements FIRST
    const chatbox = document.getElementById("chatbox");
    const input = document.getElementById("input");
    const inputArea = document.getElementById("inputArea");
    const welcome = document.getElementById("welcome");

    // 🔥 LOAD OLD MESSAGES
    async function loadMessages() {
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error(error);
            return;
        }

        // ✅ hide welcome if chat exists
        if (data.length > 0 && welcome) {
            welcome.style.display = "none";
            inputArea.classList.remove("center");
            inputArea.classList.add("bottom");
        }

        data.forEach(msg => {
            const div = document.createElement("div");
            div.classList.add("message", msg.role);

            // ✅ FIX: keep formatting for bot
            div.innerHTML = msg.role === "bot"
                ? formatMessage(msg.content)
                : msg.content;

            chatbox.appendChild(div);
        });

        chatbox.scrollTop = chatbox.scrollHeight;
    }

    loadMessages();

    // 🔥 AUTO RESIZE INPUT
    function autoResize() {
        input.style.height = "auto";
        const computed = window.getComputedStyle(input);
        const lineHeight = parseFloat(computed.lineHeight);
        const padding =
            parseFloat(computed.paddingTop) +
            parseFloat(computed.paddingBottom);

        const singleLineHeight = lineHeight + padding;

        if (input.scrollHeight > singleLineHeight + 2) {
            input.style.height = input.scrollHeight + "px";
        } else {
            input.style.height = singleLineHeight + "px";
        }
    }

    input.addEventListener("input", autoResize);

    // 🔥 SEND MESSAGE
    window.sendMessage = async function () {
        let message = input.value.trim();
        if (!message) return;

        // hide welcome
        if (welcome) {
            welcome.style.opacity = "0";
            setTimeout(() => {
                welcome.style.display = "none";
            }, 300);
        }

        inputArea.classList.remove("center");
        inputArea.classList.add("bottom");

        // USER MESSAGE
        const userMsg = document.createElement("div");
        userMsg.classList.add("message", "user");
        userMsg.innerText = message;
        chatbox.appendChild(userMsg);

        // save user message
        await supabase.from("messages").insert([
            { role: "user", content: message }
        ]);

        input.value = "";
        input.style.height = "auto";

        chatbox.scrollTo({
            top: chatbox.scrollHeight,
            behavior: "smooth"
        });

        // typing dots
        const typingMsg = document.createElement("div");
        typingMsg.classList.add("message", "bot", "typing");
        typingMsg.innerHTML = `
        <div class="dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        `;
        chatbox.appendChild(typingMsg);

        try {
            let response = await fetch(`/chat?prompt=${encodeURIComponent(message)}`);
            if (!response.ok) {
                throw new Error("Server not responding");
            }
            let data = await response.json();
            typingMsg.remove();
            let reply = data.reply || "No response";
            const botMsg = document.createElement("div");
            botMsg.classList.add("message", "bot");
            chatbox.appendChild(botMsg);

            await typeMessage(botMsg, reply);
            botMsg.innerHTML = formatMessage(reply);

            await supabase.from("messages").insert([
                { role: "bot", content: reply }
            ]);

        } catch (err) {
            console.error("Fetch failed:", err);

            typingMsg.remove();

            const errorMsg = document.createElement("div");
            errorMsg.classList.add("message", "bot");
            errorMsg.innerText = "❌ Backend not running or error";
            chatbox.appendChild(errorMsg);
        }
    };

    // ENTER KEY
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // FORMAT MESSAGE
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

    window.useSuggestion = function (el) {
        input.value = el.innerText.trim();
        sendMessage();
    };

    async function typeMessage(element, text) {
        let words = text.split(" ");
        element.innerHTML = "";

        for (let i = 0; i < words.length; i++) {
            element.innerHTML += words[i] + " ";
            await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
        }
    }

});