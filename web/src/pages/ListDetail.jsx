import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import ListMembers from "./ListMembers";

export default function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchList();
    fetchTasks();
  }, [id]);

  const fetchList = async () => {
    try {
      const res = await api.get(`/lists/${id}`);
      setList(res.data);
      // Déterminer le rôle (simplifié - dans un vrai projet, on le récupérerait du backend)
      setRole(res.data.ownerId === parseInt(localStorage.getItem('userId')) ? 'owner' : 'member');
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors du chargement");
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lists/${id}/tasks`);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la récupération des tâches");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await api.post(`/lists/${id}/tasks`, { 
        title: newTitle,
        dueDate: newDueDate || null
      });
      setTasks([...tasks, res.data]);
      setNewTitle("");
      setNewDueDate("");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      // Trouver la tâche actuelle pour obtenir updatedAt
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) return;

      const res = await api.put(`/tasks/${taskId}`, { 
        ...updates, 
        updatedAt: currentTask.updatedAt 
      });
      
      setTasks(tasks.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Conflit détecté : la tâche a été modifiée par un autre utilisateur. Rechargement...");
        fetchTasks(); // Recharger les tâches
      } else if (err.response?.status === 428) {
        alert("Erreur : version manquante. Veuillez recharger la page.");
      } else {
        alert(err.response?.data?.error || "Erreur lors de la modification");
      }
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  const renameList = async (newName) => {
    try {
      const res = await api.put(`/lists/${id}`, { name: newName });
      setList(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du renommage");
    }
  };

  if (loading && !list) return <p>Chargement...</p>;
  if (error && !list) return <p style={{ color: "red" }}>{error}</p>;
  if (!list) return <p>Liste introuvable</p>;

  if (showMembers && list.isCoop) {
    return <ListMembers list={list} onBack={() => setShowMembers(false)} />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <button onClick={() => navigate("/lists")}>← Retour aux listes</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <h2>{list.name} {list.isCoop && <span style={{ color: 'blue' }}>(Coopérative)</span>}</h2>
        {list.isCoop && role === 'owner' && (
          <button onClick={() => setShowMembers(true)}>Gérer les membres</button>
        )}
      </div>

      <form onSubmit={addTask} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Nouvelle tâche"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <button type="submit">Ajouter</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map((t) => (
          <div 
            key={t.id} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '15px', 
              borderRadius: '5px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="checkbox"
              checked={t.done || false}
              onChange={(e) => updateTask(t.id, { done: e.target.checked })}
            />
            <input
              type="text"
              value={t.title}
              onChange={(e) => updateTask(t.id, { title: e.target.value })}
              onBlur={(e) => {
                if (e.target.value !== t.title) {
                  updateTask(t.id, { title: e.target.value });
                }
              }}
              style={{ flex: 1, textDecoration: t.done ? 'line-through' : 'none' }}
            />
            {t.dueDate && (
              <span style={{ color: 'gray' }}>
                Échéance: {new Date(t.dueDate).toLocaleDateString()}
              </span>
            )}
            <input
              type="date"
              value={t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => updateTask(t.id, { dueDate: e.target.value || null })}
            />
            <button onClick={() => deleteTask(t.id)}>Supprimer</button>
          </div>
        ))}
      </div>

      {tasks.length === 0 && !loading && (
        <p>Aucune tâche. Ajoutez-en une ci-dessus.</p>
      )}
    </div>
  );
}
