import { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Link as LinkIcon, Clock, Trash, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventTypes() {
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', duration: 30, slug: '', description: '', bufferTime: 0 });

  const loadEvents = () => api.getEventTypes().then(setEvents);
  useEffect(() => { loadEvents(); }, []);

  const handleCreateOrUpdate = async (e: any) => {
    e.preventDefault();
    try {
        if(editingId) {
            await api.updateEventType(editingId, formData);
        } else {
            await api.createEventType(formData);
        }
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', duration: 30, slug: '', description: '', bufferTime: 0 });
        loadEvents();
    } catch (err: any) {
        alert(err.message || 'Failed to save event type');
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this event type?')) {
      await api.deleteEventType(id);
      loadEvents();
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    alert('Public link copied to clipboard!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 mt-8">
        <h1 className="text-3xl font-bold">Event Types</h1>
        <button className="btn btn-primary" onClick={() => {
            setEditingId(null);
            setFormData({ name: '', duration: 30, slug: '', description: '', bufferTime: 0 });
            setShowModal(true);
        }}>
          <Plus size={18} strokeWidth={2.5}/> New Event Type
        </button>
      </div>

      <div className="grid grid-cols-3">
        {Array.isArray(events) && events.map(ev => (
          <div key={ev.id} className="card hoverable flex flex-col justify-between" style={{ padding: 0, overflow: 'hidden', borderTop: '5px solid var(--primary-color)' }}>
            <div style={{ padding: '1.5rem' }}>
               <h3 className="text-xl font-bold mb-2">{ev.name}</h3>
               <div className="text-gray flex items-center gap-2 mb-3 font-medium"><Clock size={16}/> {ev.duration} mins</div>
               {ev.description && <p className="text-sm text-gray">{ev.description}</p>}
               <Link to={`/book/${ev.slug}`} target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: '1rem' }}>
                 /{ev.slug}
               </Link>
            </div>
            
            <div className="flex justify-between items-center" style={{ background: '#fafafa', borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => copyLink(ev.slug)}>
                  <LinkIcon size={14} /> Copy link
                </button>
                <div className="flex gap-2">
                   <button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%'}} onClick={() => {
                       setEditingId(ev.id);
                       setFormData({ name: ev.name, duration: ev.duration, slug: ev.slug, description: ev.description || '', bufferTime: ev.bufferTime || 0 });
                       setShowModal(true);
                   }} title="Edit Event">
                      <Edit2 size={16} />
                   </button>
                   <button style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', padding: '0.5rem', borderRadius: '50%'}} onClick={() => handleDelete(ev.id)} title="Delete Event">
                      <Trash size={16} />
                   </button>
                </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-gray text-center" style={{ gridColumn: '1 / -1', padding: '3rem 0' }}>
             No event types created yet. Click "New Event Type" to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div className="card" style={{ width: '450px' }}>
             <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit event type' : 'Add new event type'}</h2>
             <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-4">
                <div>
                   <label className="label">Event Name</label>
                   <input required className="input" value={formData.name} onChange={e => {
                     const name = e.target.value;
                     const targetSlug = name.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
                     setFormData({...formData, name, slug: formData.slug || targetSlug});
                   }} placeholder="e.g. 15 Minute Meeting" />
                </div>
                <div>
                   <label className="label">URL Slug</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <span className="text-gray">/book/</span>
                     <input required className="input" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase()})} placeholder="e.g. 15min" />
                   </div>
                </div>
                <div>
                   <label className="label">Duration (minutes)</label>
                   <input required type="number" min="5" max="720" className="input" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} />
                </div>
                <div>
                   <label className="label">Buffer Time Between Meetings (mins)</label>
                   <input required type="number" min="0" max="120" className="input" value={formData.bufferTime} onChange={e => setFormData({...formData, bufferTime: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                   <label className="label">Description / Instructions</label>
                   <textarea className="input" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Information invitee will see when booking..."></textarea>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                   <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#f1f3f4', color: '#1a1a1a' }}>Cancel</button>
                   <button type="submit" className="btn btn-primary">Save Event Type</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
