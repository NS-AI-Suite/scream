// STREAM CONNECTION
const evtSource = new EventSource("/stream");
const streamContainer = document.getElementById("streamContainer"); // Ensure definition

// VOICE CAPTURE STATE
let mic_stream = null;
let media_recorder = null;
let audio_chunks = [];
let vad_active = false;
let silence_timer = null;
let safety_timer = null;
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

// VAD: monitor rms on analyser, resolve when 1.5s silence after speech detected
function run_vad(analyser) {
  return new Promise((resolve) => {
    const buf = new Float32Array(analyser.fftSize);
    const rms_threshold = 0.015;
    const silence_ms = 1500;
    let speech_detected = false;

    const tick = () => {
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);

      if (rms > rms_threshold) {
        speech_detected = true;
        if (silence_timer) {
          clearTimeout(silence_timer);
          silence_timer = null;
        }
      } else if (speech_detected && !silence_timer) {
        silence_timer = setTimeout(() => {
          resolve();
        }, silence_ms);
      }

      if (!vad_active) return;
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}

// STOP RECORDING AND TRANSCRIBE
function stop_and_transcribe() {
  vad_active = false;
  if (silence_timer) { clearTimeout(silence_timer); silence_timer = null; }
  if (safety_timer) { clearTimeout(safety_timer); safety_timer = null; }
  if (media_recorder && media_recorder.state !== "inactive") {
    media_recorder.stop();
  }
}

async function transcribe_and_send(blob) {
  voiceStatus.innerText = "PROCESSING";
  voiceStatus.style.color = "var(--neon-green)";
  summonBtn.classList.remove("active");

  let transcript = "";
  try {
    const res = await fetch("https://voice.bravetto.ai/transcribe", {
      method: "POST",
      headers: { "Content-Type": blob.type || "audio/webm" },
      body: blob,
    });
    if (!res.ok) throw new Error("Transcribe failed: " + res.status);
    const data = await res.json();
    transcript = (data.text || "").trim();
  } catch (err) {
    console.error("Transcription error:", err);
    voiceStatus.innerText = "ERR_TRANSCRIBE";
    voiceStatus.style.color = "var(--neon-red)";
    setTimeout(() => {
      voiceStatus.innerText = "OFFLINE";
      voiceStatus.style.color = "#666";
    }, 2000);
    return;
  }

  if (!transcript) {
    voiceStatus.innerText = "OFFLINE";
    voiceStatus.style.color = "#666";
    return;
  }

  try {
    const res = await fetch("/input", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: transcript }),
    });
    const data = await res.json();
    if (data.response) {
      speak(data.response);
    }
  } catch (err) {
    console.error("Input failed:", err);
    voiceStatus.innerText = "OFFLINE";
    voiceStatus.style.color = "#666";
  }
}

// ACTIONS
summonBtn.addEventListener("click", async () => {
  if (isSpeaking) return;

  playWhoosh();
  voiceStatus.innerText = "LISTENING";
  voiceStatus.style.color = "var(--neon-green)";
  summonBtn.classList.add("active");

  try {
    if (!mic_stream) {
      mic_stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }

    // build analyser for VAD
    const vad_ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = vad_ctx.createMediaStreamSource(mic_stream);
    const analyser = vad_ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    // pick mime type
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/mp4";

    audio_chunks = [];
    media_recorder = new MediaRecorder(mic_stream, { mimeType: mime });

    media_recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) audio_chunks.push(e.data);
    };

    media_recorder.onstop = async () => {
      await vad_ctx.close();
      const blob = new Blob(audio_chunks, { type: mime });
      audio_chunks = [];
      await transcribe_and_send(blob);
    };

    media_recorder.start(100); // collect chunks every 100ms
    vad_active = true;

    // 30s safety cap
    safety_timer = setTimeout(() => {
      stop_and_transcribe();
    }, 30000);

    // run VAD — resolves after 1.5s silence post-speech
    await run_vad(analyser);
    stop_and_transcribe();

  } catch (err) {
    console.error("Mic error:", err);
    voiceStatus.innerText = "ERR_MIC";
    voiceStatus.style.color = "var(--neon-red)";
    summonBtn.classList.remove("active");
    setTimeout(() => {
      voiceStatus.innerText = "OFFLINE";
      voiceStatus.style.color = "#666";
    }, 2000);
  }
});

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
