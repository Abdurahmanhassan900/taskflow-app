import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Dummy components for demonstration
const Login = () => <div><h2>Login Page</h2><p>Please log in</p></div>;
const Register = () => <div><h2>Register Page</h2><p>Create an account</p></div>;
const Dashboard = () => <div><h2>Dashboard</h2><p>Welcome to the protected dashboard!</p></div>;

function App() {
  return (
    <Router>
      <div className="app">
        <h1>Taskflow App</h1>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
