import { useState } from 'react';
import Login from './pages/Login';
import Lists from './pages/Lists';

function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem('token'));

  if (!logged) {
    return <Login onLogin={() => setLogged(true)} />;
  }

  return <Lists />;
}

export default App;
