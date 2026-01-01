import { useState } from 'react';
import api from '../api/client';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    onLogin();
  };

  return (
    <form onSubmit={submit}>
      <h2>Connexion</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
      <button>Se connecter</button>
    </form>
  );
}
