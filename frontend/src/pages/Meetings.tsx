import { useEffect, useState } from 'react';
import { api } from '../api';
import { format, isPast } from 'date-fns';
import { User, Clock, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Meetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const loadMeetings = () => api.getMeetings().then(setMeetings);
  useEffect(() => { loadMeetings(); }, []);

  const handleCancel = async (id: string) => {
    if(confirm('Are you sure you want to cancel this meeting?')) {
      await api.cancelMeeting(id);
      loadMeetings();
    }
  };

  const filtered = meetings.filter(m => {
     const isMeetingPast = isPast(new Date(m.endTime));
     return tab === 'upcoming' ? !isMeetingPast : isMeetingPast;
  });

  return (
    <div className="container-sm" style={{ padding: 0, paddingTop: '2rem' }}>
      <h1 className="text-3xl font-bold mb-8">Meetings</h1>
      
      <div className="flex gap-4 mb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
         <button 
           className={`nav-link ${tab === 'upcoming' ? 'active' : ''}`} 
           style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', paddingBottom: '1rem', marginBottom: '-1px', borderBottom: tab === 'upcoming' ? '3px solid var(--primary-color)' : '3px solid transparent' }}
           onClick={() => setTab('upcoming')}
         >Upcoming ({meetings.filter(m => !isPast(new Date(m.endTime))).length})</button>
         <button 
           className={`nav-link ${tab === 'past' ? 'active' : ''}`} 
           style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', paddingBottom: '1rem', marginBottom: '-1px', borderBottom: tab === 'past' ? '3px solid var(--primary-color)' : '3px solid transparent' }}
           onClick={() => setTab('past')}
         >Past ({meetings.filter(m => isPast(new Date(m.endTime))).length})</button>
      </div>

      <div className="flex flex-col gap-4">
         {filtered.length === 0 ? (
           <div className="card text-center text-gray py-12">
              No {tab} meetings.
           </div>
         ) : filtered.map(m => (
           <div key={m.id} className="card flex items-center justify-between" style={{ opacity: m.status === 'canceled' ? 0.6 : 1 }}>
              <div className="flex gap-6 items-center">
                 <div style={{ width: '150px' }}>
                    <div className="font-bold text-lg">{format(new Date(m.startTime), 'MMM d, yyyy')}</div>
                    <div className="text-gray">{format(new Date(m.startTime), 'h:mm a')} - {format(new Date(m.endTime), 'h:mm a')}</div>
                 </div>
                 <div style={{ width: '12px', height: '12px', background: m.status === 'canceled' ? 'var(--danger-color)' : 'var(--primary-color)', borderRadius: '50%' }}></div>
                 <div>
                    <div className="font-bold text-lg">{m.inviteeName}</div>
                    <div className="text-gray flex items-center gap-2"><User size={14}/> {m.inviteeEmail}</div>
                 </div>
                 <div style={{ marginLeft: '2rem' }}>
                    <div className="font-medium">{m.eventType?.name}</div>
                    <div className="text-gray flex items-center gap-2"><Clock size={14}/> {m.eventType?.duration} min</div>
                 </div>
              </div>
              
              <div>
                 {m.status === 'canceled' ? (
                   <span className="text-danger font-bold flex items-center gap-1"><Ban size={16}/> Canceled</span>
                 ) : (
                   tab === 'upcoming' && (
                     <div className="flex gap-2">
                       <Link to={`/reschedule/${m.id}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>
                          Reschedule
                       </Link>
                       <button className="btn btn-outline" style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }} onClick={() => handleCancel(m.id)}>
                          Cancel
                       </button>
                     </div>
                   )
                 )}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
