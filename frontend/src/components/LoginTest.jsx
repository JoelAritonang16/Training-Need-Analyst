import React, { useState } from 'react';

const LoginTest = () => {
  const [result, setResult] = useState('');

  const testBackendConnection = async () => {
    try {
      setResult('Testing backend connection...');
      
      const response = await fetch('http://localhost:5000/api/health');
      const data = await response.json();
      
      setResult(`Backend connection: ${data.success ? 'SUCCESS' : 'FAILED'}`);
    } catch (error) {
      setResult(`Backend connection FAILED: ${error.message}`);
    }
  };

  const testLogin = async () => {
    try {
      setResult('Testing login...');
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'superadmin',
          password: 'admin123'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(`Login SUCCESS: ${JSON.stringify(data.user)}`);
      } else {
        setResult(`Login FAILED: ${data.message}`);
      }
    } catch (error) {
      setResult(`Login ERROR: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Backend Connection Test</h3>
      <button onClick={testBackendConnection} style={{ margin: '10px', padding: '10px' }}>
        Test Backend Connection
      </button>
      <button onClick={testLogin} style={{ margin: '10px', padding: '10px' }}>
        Test Login
      </button>
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        background: '#f0f0f0', 
        borderRadius: '5px',
        minHeight: '50px'
      }}>
        <strong>Result:</strong><br />
        {result}
      </div>
    </div>
  );
};

export default LoginTest;
