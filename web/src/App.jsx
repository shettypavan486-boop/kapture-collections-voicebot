import { useEffect, useRef, useState } from "react";
import * as VapiModule from "@vapi-ai/web";
import "./App.css";

function App() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("Ready to call");
  const [messages, setMessages] = useState([]);

  const vapiRef = useRef(null);

  const publicKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

  useEffect(() => {
    console.log("Public key exists:", !!publicKey);
    console.log("Assistant ID exists:", !!assistantId);

    if (!publicKey) {
      setStatus("Vapi public key is missing");
      console.error("VITE_VAPI_PUBLIC_KEY is missing");
      return;
    }

    if (!assistantId) {
      setStatus("Vapi assistant ID is missing");
      console.error("VITE_VAPI_ASSISTANT_ID is missing");
      return;
    }

    try {
      // Initialize Vapi
      const VapiClass =
  VapiModule.default?.default ||
  VapiModule.default ||
  VapiModule.Vapi;

console.log("Resolved Vapi class:", VapiClass);

if (typeof VapiClass !== "function") {
  throw new Error("Could not resolve Vapi constructor");
}

const vapi = new VapiClass(publicKey);

console.log("Vapi initialized successfully:", vapi);

vapiRef.current = vapi;


      // Call started
      vapi.on("call-start", () => {
        console.log("Call started");
        setStarted(true);
        setStatus("Call connected");
      });

      // Call ended
      vapi.on("call-end", () => {
        console.log("Call ended");
        setStarted(false);
        setStatus("Call ended");
      });

      // Speech started
      vapi.on("speech-start", () => {
        console.log("Assistant started speaking");
        setStatus("Assistant speaking...");
      });

      // Speech ended
      vapi.on("speech-end", () => {
        console.log("Assistant stopped speaking");
        setStatus("Listening...");
      });

      // Messages / transcripts
      vapi.on("message", (message) => {
  console.log("Vapi message:", message);

  if (
    message.type === "transcript" &&
    message.transcriptType === "final"
  ) {
    setMessages((previous) => [
      ...previous,
      {
        role: message.role,
        text: message.transcript,
      },
    ]);
  }
});

      // Errors
      vapi.on("error", (error) => {
        console.error("Vapi error:", error);
        setStatus("Call error");
      });

      // Cleanup
      return () => {
        vapi.stop();
        vapi.removeAllListeners();
        vapiRef.current = null;
      };
    } catch (error) {
      console.error("VAPI INIT ERROR:", error);
      console.error("Error message:", error.message);

      setStatus("Vapi initialization failed");
    }
  }, [publicKey, assistantId]);

  const startCall = async () => {
    try {
      if (!vapiRef.current) {
        console.error("Vapi is not initialized");
        setStatus("Vapi is not initialized");
        return;
      }

      if (!assistantId) {
        console.error("Assistant ID is missing");
        setStatus("Assistant ID is missing");
        return;
      }

      console.log("Starting assistant:", assistantId);

      setStatus("Starting call...");

      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error("START CALL ERROR:", error);
      setStatus("Unable to start call");
    }
  };

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Kapture Finance</h1>

        <p className="subtitle">
          Voice-based customer support assistant
        </p>

        <p className="status">{status}</p>

        {!started ? (
          <button onClick={startCall} className="call-button">
            🎙️ Start Call
          </button>
        ) : (
          <button onClick={endCall} className="call-button">
            📞 End Call
          </button>
        )}

        {messages.length > 0 && (
          <div className="transcript">
            <h2>Conversation</h2>

            {messages.map((message, index) => (
              <div key={index} className="message">
                <strong>
                  {message.role === "assistant"
                    ? "Maya"
                    : "You"}
                  :
                </strong>{" "}
                {message.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;