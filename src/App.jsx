import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TravelForm from "./components/TravelForm";
import ChatWindow from "./components/ChatWindow";
import AdminDashboard from "./components/AdminDashboard";
import logo from "./assets/travel-agent.png";

function MainApp() {
  const [messages, setMessages] = useState([]);

  const handleResponse = (response) => {
    setMessages((prev) => [...prev, { sender: "Bot", text: response }]);
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 px-6 py-6">
      <h1 className="text-4xl font-bold text-center mb-10 text-amber-700"> <span className="text-orange-400 bg-red-900 rounded-xl"> AryaAI  </span> : The Smart Travel Agent</h1>
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2">
          <TravelForm onResponse={handleResponse} />
        </div>
        <div className="w-full md:w-1/2">
          <ChatWindow messages={messages} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        
        <nav className="bg-blue-300 shadow-lg border-b-blue-300 border-green-400 shadow-green-800">
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-green-800">
          <img src={logo} alt="Logo" className="h-8 w-8" />
          <span className="text-lg font-semibold">АячаАЇ</span>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <Link 
          to="/" 
          className="text-black hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
        >
          Home
        </Link>
        <Link 
          to="/admin" 
          className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Admin Dashboard
        </Link>
      </div>
    </div>
  </div>
</nav>


        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
