import api from "../api/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Lists({ onSelect }) {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newListName, setNewListName] = useState("");
  const [isCoop, setIsCoop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await api.get("/lists");
      setLists(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur chargement des listes");
    } finally {
      setLoading(false);
    }
  };

  const createList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      const res = await api.post("/lists", { name: newListName, isCoop });
      setLists([...lists, res.data]);
      setNewListName("");
      setIsCoop(false);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la création");
    }
  };

  const deleteList = async (listId, e) => {
    e.stopPropagation();
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette liste ?")) return;

    try {
      await api.delete(`/lists/${listId}`);
      setLists(lists.filter(l => l.id !== listId));
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>Mes listes de tâches</h1>

      <form onSubmit={createList} style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Nom de la liste"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          style={{ flex: 1 }}
        />
        <label>
          <input
            type="checkbox"
            checked={isCoop}
            onChange={(e) => setIsCoop(e.target.checked)}
          />
          Coopérative
        </label>
        <button type="submit">Créer</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {lists.map(l => (
          <div 
            key={l.id} 
            onClick={() => navigate(`/lists/${l.id}`)}
            style={{ 
              border: '1px solid #ccc', 
              padding: '15px', 
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong>{l.name}</strong>
              {l.isCoop && <span style={{ marginLeft: '10px', color: 'blue' }}>(Coopérative)</span>}
            </div>
            <button onClick={(e) => deleteList(l.id, e)}>Supprimer</button>
          </div>
        ))}
      </div>

      {lists.length === 0 && !loading && (
        <p>Aucune liste. Créez-en une ci-dessus.</p>
      )}
    </div>
  );
}
