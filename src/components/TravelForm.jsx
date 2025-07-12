import { useState } from "react";
import axios from "axios";

const inputFields = [
  { name: "destination", placeholder: "Destination", icon: "🌍", type: "text" },
  { name: "days", placeholder: "Days", icon: "📅", type: "number" },
  { name: "budget", placeholder: "Budget", icon: "💸", type: "text" },
  { name: "preferences", placeholder: "Preferences", icon: "✨", type: "text" },
];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const TravelForm = ({ onResponse }) => {
  const [formData, setFormData] = useState({
    destination: "",
    days: "",
    budget: "",
    preferences: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [listeningField, setListeningField] = useState("");
  const [voicePrompt, setVoicePrompt] = useState("");
  const [isListeningPrompt, setIsListeningPrompt] = useState(false);

  const handleVoicePrompt = () => {
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }

    setIsListeningPrompt(true);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoicePrompt(transcript);
      setIsListeningPrompt(false);
    };

    recognition.onerror = (event) => {
      alert(`Voice recognition error: ${event.error}`);
      setIsListeningPrompt(false);
    };

    recognition.onend = () => {
      setIsListeningPrompt(false);
    };

    try {
      recognition.start();
    } catch {
      alert("Error starting voice recognition. Please try again.");
      setIsListeningPrompt(false);
    }
  };

  const handleVoicePromptSubmit = async (e) => {
    e.preventDefault();
    if (!voicePrompt.trim()) {
      setError("Please speak your travel request first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { prompt: voicePrompt });
      onResponse(res.data.response);
    } catch {
      onResponse("Error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField("");

  const handleVoiceInput = (fieldName) => {
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support speech recognition. Try Chrome or Edge.");
      return;
    }

    setListeningField(fieldName);
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({ ...prev, [fieldName]: transcript }));
      setListeningField("");
    };

    recognition.onerror = (event) => {
      alert(`Voice recognition error: ${event.error}`);
      setListeningField("");
    };

    recognition.onend = () => {
      setListeningField("");
    };

    try {
      recognition.start();
    } catch {
      alert("Error starting voice recognition. Please try again.");
      setListeningField("");
    }
  };

  const validate = () => {
    for (const field of inputFields) {
      if (!formData[field.name]) {
        setError(`Please enter your ${field.placeholder.toLowerCase()}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", formData);
      onResponse(res.data.response);
    } catch {
      onResponse("Error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-100 shadow-2xl rounded-2xl p-8 space-y-6 border border-blue-100 animate-fadeIn"
      style={{ transition: 'background 0.5s' }}
    >
      <h2 className="text-2xl font-bold text-amber-950 mb-2 text-center tracking-tight">Plan Your Dream Trip</h2>
      <p className="text-center text-gray-500 mb-4">Fill in your details and get a personalized travel plan powered by AI!</p>

      {inputFields.map((field) => {
        const isActive = focusedField === field.name || formData[field.name];
        return (
          <div key={field.name} className="relative mb-4 flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{field.icon}</span>
            <input
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              onFocus={() => handleFocus(field.name)}
              onBlur={handleBlur}
              className={`w-full pl-10 pr-12 py-3 border rounded-xl bg-white/80 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 shadow-sm ${formData[field.name] ? 'border-blue-400' : 'border-gray-300'}`}
              placeholder=" "
              autoComplete="off"
              disabled={loading}
            />
            <label
              htmlFor={field.name}
              className={`absolute left-10 transition-all duration-200 bg-transparent px-1 pointer-events-none ${isActive ? '-top-3.5 text-xs text-blue-600 bg-blue-50' : 'top-1/2 -translate-y-1/2 text-gray-500'}`}
              style={{ background: isActive ? '#f0f7ff' : 'transparent' }}
            >
              {field.placeholder}
            </label>
            <button
              type="button"
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full border ${listeningField === field.name ? 'bg-blue-100 border-blue-400 animate-pulse' : 'bg-white border-gray-300'} text-blue-600 hover:bg-blue-50`}
              onClick={() => handleVoiceInput(field.name)}
              disabled={loading}
            >
              {listeningField === field.name ? (
                <svg className="h-5 w-5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0c-3.314 0-6-2.686-6-6m6 6c3.314 0 6-2.686 6-6m-6 6v-2m0-6a2 2 0 002-2V7a2 2 0 10-4 0v3a2 2 0 002 2z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v2m0 0c-3.314 0-6-2.686-6-6m6 6c3.314 0 6-2.686 6-6m-6 6v-2m0-6a2 2 0 002-2V7a2 2 0 10-4 0v3a2 2 0 002 2z" /></svg>
              )}
            </button>
          </div>
        );
      })}

      {error && <div className="text-red-500 text-center font-medium animate-pulse">{error}</div>}

      <button
        type="submit"
        className="w-full flex items-center justify-center bg-gradient-to-r from-red-400 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-yellow-200 hover:to-purple-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading && (
          <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        )}
        {loading ? "Generating..." : "Get Travel Plan"}
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-400 text-xs">or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="mb-4 flex flex-col items-center">
        <button
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-400 bg-white text-blue-700 font-semibold shadow hover:bg-blue-50 ${isListeningPrompt ? 'animate-pulse border-2' : ''}`}
          onClick={handleVoicePrompt}
          disabled={loading || isListeningPrompt}
        >
          <span role="img" aria-label="mic">🎤</span>
          {isListeningPrompt ? "Listening..." : "Speak your travel request"}
        </button>
        <textarea
          className="mt-3 w-full rounded-lg border border-gray-300 p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          rows={2}
          placeholder="Your spoken request will appear here..."
          value={voicePrompt}
          onChange={e => setVoicePrompt(e.target.value)}
          disabled={loading || isListeningPrompt}
        />
        <button
          type="button"
          className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleVoicePromptSubmit}
          disabled={loading || !voicePrompt.trim()}
        >
          Submit Voice Request
        </button>
      </div>

      <center>
        <a
          href="https://wa.me/919604944347?text=Hi%20AryaAI!%20Help%20me%20plan%20a%20trip."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow-md"
        >
          💬 Chat on WhatsApp
        </a>
      </center>
    </form>
  );
};

export default TravelForm;
