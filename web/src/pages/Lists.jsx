import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Lists({ onSelect }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        setLoading(true);
        const res = await api.get('/task-lists'); // endpoint sécurisé
        setLists(res.data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Erreur lors de la récupération des listes');
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  if (loading) return <p>Chargement des listes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Mes listes</h2>
      {lists.length === 0 && <p>Aucune liste disponible</p>}
      {lists.map((l) => (
        <div key={l.id} onClick={() => onSelect(l)} style={{ cursor: 'pointer', marginBottom: 5 }}>
          <strong>{l.name}</strong> {l.isCoop && <span style={{ color: 'blue' }}>[Coopérative]</span>}
        </div>
      ))}
    </div>
  );
}
