async function sendMessage(e) {
  e.preventDefault();
  console.log("Button Clicked");

  let input = document.getElementById("chat-input");
  let message = input.value.trim();
  if (!message) return;

  let chatBody = document.getElementById("chat-body");
  chatBody.innerHTML += `<p><b>You:</b> ${message}</p>`;

 try{ //  Send to AI
  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });
  
  console.log("Response status:", res.status);
  

  const data = await res.json();
  console.log("Response:", data);

  //chatBody.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;

} catch (err) {
    console.error("Fetch error" , err);
    chatBody.innerHTML += `<p>Bot: ${data.reply}<p/>`;
}

  input.value = "";
}


function toggleChat() {
  const chat = document.getElementById("chatbot");
  chat.style.display = chat.style.display === "block" ? "none" : "block";
}
function handleKey(e) {
  if (e.key === "Enter") {
    let input = document.getElementById("chat-input");
    let message = input.value;

    let chatBody = document.getElementById("chat-body");
    chatBody.innerHTML += "<p><b>You:</b> " + message + "</p>";

    // Simple response logic
    if (message.toLowerCase().includes("how")) {
      chatBody.innerHTML += "<p><b>Bot:</b> We connect students to services easily.</p>";
    } else {
      chatBody.innerHTML += "<p><b>Bot:</b> I’m still learning 😅</p>";
    }

    input.value = "";
  }
}

