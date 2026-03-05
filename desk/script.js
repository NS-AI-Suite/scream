// STREAM CONNECTION
const evtSource = new EventSource("/stream");
const streamContainer = document.getElementById("streamContainer"); // Ensure definition

// VOICE & RECOGNITION SETUP
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "en-US";
recognition.interimResults = false;

const synth = window.speechSynthesis;
let isSpeaking = false;

const summonBtn = document.getElementById("summonButton");
const voiceStatus = document.getElementById("voiceStatus");

// SOUND FX (Synthesized)
const playWhoosh = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    800,
    audioCtx.currentTime + 0.5,
  );

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.5);
};

// ACTIONS
summonBtn.addEventListener("click", () => {
  playWhoosh();
  voiceStatus.innerText = "LISTENING...";
  voiceStatus.style.color = "var(--neon-green)";
  summonBtn.classList.add("active");
  try {
    recognition.start();
  } catch (e) {
    console.log("Already listening");
  }
});

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  voiceStatus.innerText = "PROCESSING";
  summonBtn.classList.remove("active");

  // Send to Server
  fetch("/input", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: transcript }),
  })
  .then(res => res.json())
  .then(data => {
      if (data.response) {
          speak(data.response);
      }
  })
  .catch(err => console.error("Input failed:", err));
};

recognition.onend = () => {
  if (!isSpeaking) {
    voiceStatus.innerText = "OFFLINE";
    voiceStatus.style.color = "#666";
    summonBtn.classList.remove("active");
  }
};

// SPEAK BACK (ElevenLabs Integration)
async function speak(text) {
  if (isSpeaking) return;

  // Visual State: Loading Audio
  voiceStatus.innerText = "SYNTHESIZING";
  voiceStatus.style.color = "var(--neon-green)";
  summonBtn.classList.add("active");

  try {
    const response = await fetch("/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Voice Synthesis Failed");

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.onplay = () => {
      isSpeaking = true;
      voiceStatus.innerText = "SPEAKING";
      voiceStatus.style.color = "var(--neon-green)";
    };

    audio.onended = () => {
      isSpeaking = false;
      voiceStatus.innerText = "OFFLINE";
      voiceStatus.style.color = "#666";
      summonBtn.classList.remove("active");
      URL.revokeObjectURL(audioUrl);
    };

    audio.play();
  } catch (err) {
    console.error(err);
    voiceStatus.innerText = "ERR_VOICE";
    voiceStatus.style.color = "var(--neon-red)";
    setTimeout(() => {
      voiceStatus.innerText = "OFFLINE";
      summonBtn.classList.remove("active");
    }, 2000);
  }
}

evtSource.onmessage = function (event) {
  const data = JSON.parse(event.data);

  if (data.type === "init") {
    streamContainer.innerHTML = "";
    renderMarkdown(data.content);
  } else if (data.type === "update") {
    const line = data.content;

    // Append visual
    const el = document.createElement("div");
    el.className = "thought-entry";
    el.innerText = line; // Simple text for update
    el.style.animation = "fadeIn 0.5s ease";
    streamContainer.appendChild(el);
    streamContainer.scrollTop = streamContainer.scrollHeight;

    // CHECK IF IT'S ABE TALKING to trigger Voice
    if (line.includes("ABE >")) {
      const speechText = line.split("ABE >")[1].trim();
      speak(speechText);
    }
  }
};

function renderMarkdown(text) {
  // Very simple parser for the "ZING" format
  const lines = text.split("\n");
  let html = "";

  lines.forEach((line) => {
    if (line.includes("**[")) {
      // Timestamp Header
      html += `<div class="thought-entry" style="color: #666; font-size: 0.8em; border:none; margin-bottom:5px;">${line}</div>`;
    } else if (line.trim().length > 0) {
      // Content
      html += `<div class="thought-entry">${line}</div>`;
    }
  });

  streamContainer.innerHTML = html;
  // Auto-scroll to bottom
  streamContainer.scrollTop = streamContainer.scrollHeight;
}

console.log("ABE DESK CLIENT ONLINE");
