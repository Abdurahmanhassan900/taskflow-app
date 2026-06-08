import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Tasks } from './pages/Tasks';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Tasks />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
