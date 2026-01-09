import { useEffect, useState } from "react";
import api from "../api/client";

export default function ListMembers({ list, onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("reader");

  useEffect(() => {
    fetchMembers();
  }, [list.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lists/${list.id}/members`);
      setMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la récupération des membres");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const res = await api.post(`/lists/${list.id}/members`, {
        email: newEmail,
        role: newRole,
      });
      setMembers([...members, res.data]);
      setNewEmail("");
      setNewRole("reader");
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const updateRole = async (userId, role) => {
    try {
      const res = await api.put(`/lists/${list.id}/members/${userId}`, { role });
      setMembers(members.map((m) => (m.userId === userId ? res.data : m)));
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la modification");
    }
  };

  const removeMember = async (userId) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer ce membre ?")) return;

    try {
      await api.delete(`/lists/${list.id}/members/${userId}`);
      setMembers(members.filter((m) => m.userId !== userId));
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  if (loading) return <p>Chargement des membres...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <button onClick={onBack}>← Retour</button>
      <h2>Membres de {list.name}</h2>

      <form onSubmit={addMember} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input
          type="email"
          placeholder="Email du membre"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="reader">Reader</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
        <button type="submit">Ajouter</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {members.map((m) => (
          <div 
            key={m.userId} 
            style={{ 
              border: '1px solid #ccc', 
              padding: '15px', 
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong>{m.email}</strong> - <span>{m.role}</span>
            </div>
            {m.role !== "owner" && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={m.role}
                  onChange={(e) => updateRole(m.userId, e.target.value)}
                >
                  <option value="reader">Reader</option>
                  <option value="editor">Editor</option>
                </select>
                <button onClick={() => removeMember(m.userId)}>Retirer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
