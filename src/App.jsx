import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './routes/signIn.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
      </Routes>
    </Router>
  );
}

export default App;
