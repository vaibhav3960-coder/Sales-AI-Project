import { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';

export default function LandingPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.getEventTypes().then(setEvents);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header justify-center">
        <Link to="/" className="header-logo">
          <Calendar size={28} />
          John Doe
        </Link>
      </header>

      <main className="container flex-1 py-12" style={{ maxWidth: '800px', width: '100%' }}>
         <div className="text-center mb-12">
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>
               JD
            </div>
            <h1 className="text-2xl font-bold">John Doe</h1>
            <p className="text-gray mt-2">Welcome to my scheduling page. Please follow the instructions to add an event to my calendar.</p>
         </div>

         <div className="grid grid-cols-2">
            {events.map((ev) => (
              <Link to={`/book/${ev.slug}`} key={ev.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card hoverable flex items-center justify-between" style={{ padding: '1.5rem', borderLeft: '5px solid var(--primary-color)' }}>
                   <div>
                     <h3 className="text-xl font-bold mb-2">{ev.name}</h3>
                     <div className="text-gray flex items-center gap-2 font-medium">
                       <Clock size={16}/> {ev.duration} mins
                     </div>
                   </div>
                   <div style={{ color: 'var(--primary-color)' }}>
                      &rarr;
                   </div>
                </div>
              </Link>
            ))}
         </div>
         {events.length === 0 && (
             <div className="text-center text-gray">No event types available currently.</div>
         )}
      </main>
    </div>
  );
}
