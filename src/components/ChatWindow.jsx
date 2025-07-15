import React, { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ChatWindow({ messages, isTyping }) {
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender.toLowerCase() !== 'user') {
      const utter = new SpeechSynthesisUtterance(lastMessage.text);
      utter.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, [messages]);

  const downloadPDF = () => {
    const hiddenDiv = document.getElementById('pdf-chat');
    if (!hiddenDiv) {
      console.error('pdf-chat element not found!');
      return;
    }

    hiddenDiv.style.display = 'block';
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.top = '-9999px';
    hiddenDiv.style.left = '-9999px';

    setTimeout(() => {
      html2canvas(hiddenDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          if (!imgData.startsWith('data:image/png')) throw new Error('Invalid PNG data');

          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pdfWidth - 20;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 10;

          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }

          pdf.save('AryaAI_travel_plan.pdf');
        })
        .catch((err) => {
          console.error('Error generating PDF:', err);
          alert('PDF generation failed. Try again.');
        })
        .finally(() => {
          hiddenDiv.style.display = 'none';
          hiddenDiv.style.position = 'static';
        });
    }, 200);
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-center bg-blue-950 text-white rounded-t-2xl">You will get your itinerary here !!</h1>
      <div
        className="chat-window w-full max-h-[500px] overflow-y-auto p-4 shadow-xl rounded-b-2xl mb-4"
        id="chat-window"
        ref={chatRef}
        style={{
          background: 'linear-gradient(to right, #0f172a, #1e293b)',
          height: '500px',
        }}
      >
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 max-w-[80%] text-white rounded-lg text-sm whitespace-pre-line shadow-md ${
                msg.sender.toLowerCase() === 'user'
                  ? 'bg-blue-600 self-end ml-auto'
                  : 'bg-gray-700'
              } animate-fadeIn`}
            >
              {msg.text}
            </div>
          ))}
          {isTyping && (
            <div className="text-gray-200 italic text-center mt-2">
              ✍️ AI is typing...
            </div>
          )}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <button
            onClick={downloadPDF}
            className="bg-green-500 hover:bg-amber-200 hover:text-black text-white font-bold py-2 px-4 rounded-xl shadow-md"
          >
            📄 Download PDF
          </button>
          <button
            onClick={() => window.speechSynthesis.cancel()}
            className="bg-red-700 hover:bg-black text-white font-bold py-2 px-4 rounded-xl shadow-md"
          >
            🔇 Stop Voice
          </button>
          <button
            className="bg-pink-300 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-xl shadow-md"
            onClick={() =>
              (chatRef.current.scrollTop = chatRef.current.scrollHeight)
            }
          >
            ⬇️ Scroll to Bottom
          </button>
        </div>
      )}

      <div
        id="pdf-chat"
        style={{
          display: 'none',
          padding: '20px',
          fontFamily: 'sans-serif',
          maxWidth: '600px',
          color: '#000',
          background: '#fff',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
          🧳 AI Travel Plan
        </h2>
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '12px' }}>
            <strong>{msg.sender.toLowerCase() === 'user' ? 'You' : 'AI'}:</strong>
            <p style={{ whiteSpace: 'pre-line', margin: '4px 0' }}>{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
