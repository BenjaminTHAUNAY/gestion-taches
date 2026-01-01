import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Lists({ onSelect }) {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    api.get('/lists').then(res => setLists(res.data));
  }, []);

  return (
    <div>
      <h2>Mes listes</h2>
      {lists.map(l => (
        <div key={l.id} onClick={() => onSelect(l)}>
          {l.name}
        </div>
      ))}
    </div>
  );
}
