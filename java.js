const inputQuestion = document.getElementById("inputQuestion");
const chatBox = document.getElementById("chat-box");

// Array para manter o histórico das mensagens
let messages = [];

inputQuestion.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (inputQuestion.value.trim()) {
      SendQuestion();
    }
  }
});

const OPENAI_API_KEY = "";

function SendQuestion() {
  var sQuestion = inputQuestion.value.trim();

  // Função para obter o horário atual
  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Exibe a mensagem do usuário
  const userMessage = `
    <div class="message user">
      <div>${sQuestion}</div>
      <div class="timestamp">${getCurrentTime()}</div>
    </div>
  `;
  chatBox.innerHTML += userMessage;

  // Adiciona a pergunta ao array de mensagens
  messages.push({ role: "user", content: sQuestion });

  // Rola o chat para o fim
  chatBox.scrollTop = chatBox.scrollHeight;

  // Faz a requisição para a API do OpenAI
  fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + OPENAI_API_KEY,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages, // Envia o histórico completo de mensagens
      max_tokens: 150,
      temperature: 0,
    }),
  })
    .then((response) => response.json())
    .then((json) => {
      if (json.error?.message) {
        const errorMessage = `
          <div class="message chatgpt">
            <div>Error: ${json.error.message}</div>
            <div class="timestamp">${getCurrentTime()}</div>
          </div>
        `;
        chatBox.innerHTML += errorMessage;
      } else if (json.choices?.[0].message?.content) {
        var text = json.choices[0].message.content || "sem resposta";

        // Adiciona a resposta da IA ao histórico
        const gptMessage = `
          <div class="message chatgpt">
            <div>${text}</div>
            <div class="timestamp">${getCurrentTime()}</div>
          </div>
        `;
        chatBox.innerHTML += gptMessage;
        messages.push({ role: "assistant", content: text });

        // Rola o chat para o fim
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    })
    .catch((error) => console.error("Error:", error))
    .finally(() => {
      inputQuestion.value = "";
      inputQuestion.disabled = false;
      inputQuestion.focus();
    });

  inputQuestion.value = "Carregando...";
  inputQuestion.disabled = true;
}
