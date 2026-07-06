import React, { useState } from 'react';

export default function SimpleDebug() {
  const [log, setLog] = useState([]);
  
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLog(prev => [...prev, { message, type, timestamp }]);
  };

  const testAPI = async (endpoint, options = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://uburiza-backend.onrender.com${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      addLog(`${options.method || 'GET'} ${endpoint} - ${response.status}`, response.ok ? 'success' : 'error');
      
      const data = await response.json();
      addLog(`Response: ${JSON.stringify(data, null, 2)}`);
      
      return data;
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      throw error;
    }
  };

  const tests = [
    {
      name: 'Health Check',
      run: () => testAPI('/health')
    },
    {
      name: 'Auth Test',
      run: () => testAPI('/api/debug/auth')
    },
    {
      name: 'My Courses',
      run: () => testAPI('/api/my-courses')
    },
    {
      name: 'My Certificates',
      run: async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (!userInfo.id) {
          addLog('No user ID found in localStorage', 'error');
          return;
        }
        return testAPI(`/api/certificates/user/${userInfo.id}`);
      }
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Debug Tool</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {tests.map(test => (
          <button
            key={test.name}
            onClick={() => test.run()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {test.name}
          </button>
        ))}
      </div>
      
      <button
        onClick={() => setLog([])}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
      >
        Clear Log
      </button>
      
      <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
        {log.length === 0 ? (
          <p>Click a test button to start debugging...</p>
        ) : (
          log.map((entry, idx) => (
            <div key={idx} className={`mb-2 ${
              entry.type === 'error' ? 'text-red-400' :
              entry.type === 'success' ? 'text-green-400' :
              'text-gray-300'
            }`}>
              [{entry.timestamp}] {entry.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}