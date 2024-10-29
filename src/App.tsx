import { Routes, Route } from 'react-router-dom';
import StartPage from './components/StartPage';
import Login from './components/Login';
import HomePage from './components/Home';
import PrivateMessages from './components/PrivateMessages';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/private-messages" element={<PrivateMessages />} />
      </Routes>
    </div>
  );
}

export default App;