import { useEffect, useState } from 'react';
import { api } from '../api';
import { Save, Plus, X } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Gets all native timezones like America/New_York
  const timezones = Intl.supportedValuesOf('timeZone');

  useEffect(() => {
    api.getAvailability().then(data => {
      // Group by day
      const grouped = DAYS.map((_, index) => {
        const intervals = data.filter((d: any) => d.dayOfWeek === index);
        return {
          dayOfWeek: index,
          enabled: intervals.length > 0,
          intervals: intervals.length > 0 ? intervals.map((i: any) => ({ start: i.startTime, end: i.endTime })) : [{ start: '09:00', end: '17:00' }]
        };
      });
      setSchedule(grouped);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Flatten schedule
    const availabilities: any[] = [];
    schedule.forEach(day => {
      if (day.enabled) {
        day.intervals.forEach((interval: any) => {
          availabilities.push({
            dayOfWeek: day.dayOfWeek,
            startTime: interval.start,
            endTime: interval.end
          });
        });
      }
    });

    await api.updateAvailability(availabilities);
    setSaving(false);
    alert('Availability saved successfully!');
  };

  if(!schedule.length) return <div>Loading...</div>;

  return (
    <div className="container-sm" style={{ padding: '0', paddingTop: '2rem' }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Availability Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-semibold">Default Hours</h2>
           <div>
             <select 
                className="input" 
                style={{ padding: '0.4rem 0.8rem', width: '250px' }}
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
             >
                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
             </select>
           </div>
        </div>
        
        <div className="flex flex-col">
          {Array.isArray(schedule) && schedule.map((day, dIndex) => (
            <div key={dIndex} className="flex items-start" style={{ padding: '1.25rem 0', borderBottom: dIndex < 6 ? '1px solid var(--border-color)' : 'none' }}>
              
              <div className="flex items-center" style={{ width: '150px' }}>
                <input 
                  type="checkbox" 
                  checked={day.enabled}
                  onChange={e => {
                    const newSch = [...schedule];
                    newSch[dIndex].enabled = e.target.checked;
                    setSchedule(newSch);
                  }}
                  style={{ width: '1.2rem', height: '1.2rem', marginRight: '1rem', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 500, fontSize: '1.05rem', color: day.enabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {DAYS[day.dayOfWeek]}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-3">
                {day.enabled ? (Array.isArray(day.intervals) && day.intervals.map((interval: any, iIndex: number) => (
                  <div key={iIndex} className="flex items-center gap-3">
                    <input 
                       type="time" 
                       className="input" 
                       style={{ width: '130px', padding: '0.5rem' }} 
                       value={interval.start}
                       onChange={e => {
                         const newSch = [...schedule];
                         newSch[dIndex].intervals[iIndex].start = e.target.value;
                         setSchedule(newSch);
                       }}
                    />
                    <span className="text-gray">-</span>
                    <input 
                       type="time" 
                       className="input" 
                       style={{ width: '130px', padding: '0.5rem' }} 
                       value={interval.end}
                       onChange={e => {
                         const newSch = [...schedule];
                         newSch[dIndex].intervals[iIndex].end = e.target.value;
                         setSchedule(newSch);
                       }}
                    />
                    
                    {day.intervals.length > 1 && (
                      <button 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.5rem' }}
                        onClick={() => {
                          const newSch = [...schedule];
                          newSch[dIndex].intervals.splice(iIndex, 1);
                          setSchedule(newSch);
                        }}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))) : (
                  <div className="text-gray" style={{ padding: '0.5rem 0' }}>Unavailable</div>
                )}
              </div>
              
              {day.enabled && (
                <button 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '1rem', color: 'var(--text-secondary)' }}
                  onClick={() => {
                    const newSch = [...schedule];
                    newSch[dIndex].intervals.push({ start: '09:00', end: '17:00' });
                    setSchedule(newSch);
                  }}
                  title="Add time interval"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
