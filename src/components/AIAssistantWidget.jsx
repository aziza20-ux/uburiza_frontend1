import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI Learning Assistant. Ask me anything about this lesson!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsLeft, setQuestionsLeft] = useState(10);
  const messagesEndRef = useRef(null);

  const MAX_QUESTIONS_PER_DAY = 10;

  useEffect(() => {
    // Check usage on load
    updateQuestionsLeft();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const updateQuestionsLeft = () => {
    const usageStr = localStorage.getItem('uburiza_ai_usage');
    if (usageStr) {
      const usage = JSON.parse(usageStr);
      if (new Date(usage.date).toDateString() === new Date().toDateString()) {
        setQuestionsLeft(Math.max(0, MAX_QUESTIONS_PER_DAY - usage.count));
        return;
      }
    }
    setQuestionsLeft(MAX_QUESTIONS_PER_DAY);
  };

  const incrementUsage = () => {
    const usageStr = localStorage.getItem('uburiza_ai_usage');
    let count = 0;
    if (usageStr) {
      const usage = JSON.parse(usageStr);
      if (new Date(usage.date).toDateString() === new Date().toDateString()) {
        count = usage.count;
      }
    }
    count += 1;
    localStorage.setItem('uburiza_ai_usage', JSON.stringify({ date: new Date().toISOString(), count }));
    updateQuestionsLeft();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    if (questionsLeft <= 0) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'You have reached your limit of 10 questions for today. Please come back tomorrow!' }]);
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'API key is missing! Please configure VITE_GEMINI_API_KEY in your .env file.' }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Build conversation history for context
      const historyText = messages.slice(1).map(m => `${m.role === 'user' ? 'Learner' : 'AI'}: ${m.content}`).join('\n');
      const prompt = `You are a helpful AI Learning Assistant for Uburiza Academy. Answer the learner's question clearly and concisely.\n\nConversation history:\n${historyText}\n\nLearner: ${userMessage}\nAI:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);
      incrementUsage();
    } catch (error) {
      console.error('Error calling Gemini:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all z-50 flex items-center justify-center group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-2 font-medium">
          Ask AI Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 flex flex-col z-50 overflow-hidden font-sans h-[500px] max-h-[80vh]">
      {/* Header */}
      <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6" />
          <h3 className="font-bold">AI Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Limit Warning */}
      <div className="bg-emerald-50 text-emerald-800 text-xs py-2 px-4 flex items-center justify-between border-b border-emerald-100">
        <span className="flex items-center space-x-1">
          <AlertCircle className="w-3 h-3" />
          <span>Daily Limit</span>
        </span>
        <span className="font-bold">{questionsLeft} / {MAX_QUESTIONS_PER_DAY} left</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white border border-emerald-100 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-emerald-100 rounded-bl-sm shadow-sm flex space-x-1">
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={questionsLeft > 0 ? "Ask a question..." : "Limit reached"}
            disabled={questionsLeft <= 0 || isLoading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || questionsLeft <= 0 || isLoading}
            className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
