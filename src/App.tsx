import { Routes, Route } from 'react-router-dom';
import StartPage from './components/StartPage';
import Login from './components/Login';
import HomePage from './components/Home';
import Messages from './components/Messages';  // Добавьте этот импорт

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </div>
  );
}

export default App;