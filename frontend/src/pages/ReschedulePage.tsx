import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isPast, parse, addMinutes, subMonths, addMonths } from 'date-fns';
import { Clock, ArrowLeft, ArrowRight, Globe, Video, Calendar as Cal } from 'lucide-react';

export default function ReschedulePage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState<any>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    if(!meetingId) return;
    Promise.all([
      api.getMeeting(meetingId),
      api.getAvailability(),
      api.getMeetings()
    ]).then(([m, avail, meets]) => {
      setMeeting(m);
      setCurrentMonth(new Date(m.startTime));
      setAvailability(avail);
      setMeetings(meets);
    });
  }, [meetingId]);

  const generateTimeSlots = (date: Date) => {
    if(!meeting) return [];
    
    const dayOfWeek = date.getDay();
    const dayAvails = availability.filter(a => a.dayOfWeek === dayOfWeek);
    if(dayAvails.length === 0) return [];
    
    const slots: string[] = [];
    const eventType = meeting.eventType;
    const duration = eventType.duration;
    const buffer = eventType.bufferTime || 0;
    
    dayAvails.forEach(avail => {
      const startTime = parse(avail.startTime, 'HH:mm', date);
      const endTime = parse(avail.endTime, 'HH:mm', date);
      
      let curr = startTime;
      while(addMinutes(curr, duration) <= endTime) {
         if(!isPast(curr)) {
            const currEnd = addMinutes(curr, duration);
            
            // Check overlaps ensuring we apply proper buffer and EXCLUDE current meeting
            const isBooked = meetings.some(m => {
                if (m.status === 'canceled') return false;
                if (m.id === meetingId) return false; // Ignore current meeting being moved
                const mStart = new Date(m.startTime);
                const mEnd = new Date(m.endTime);
                
                // Add buffer to requested curr slot
                const rStart = addMinutes(curr, -buffer);
                const rEnd = addMinutes(currEnd, buffer);
                
                return (rStart < mEnd && rEnd > mStart);
            });
            
            if(!isBooked) {
                slots.push(format(curr, 'HH:mm'));
            }
         }
         curr = addMinutes(curr, 30);
      }
    });

    return Array.from(new Set(slots)).sort();
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        
        const isAvail = availability.some(a => a.dayOfWeek === cloneDay.getDay());
        const isDisabled = isPast(addDays(cloneDay, 1)) || !isAvail;

        days.push(
          <div
            className={`calendar-cell ${
              !isSameMonth(day, monthStart) ? "text-gray" : ""
            } ${selectedDate && isSameDay(day, selectedDate) ? "selected" : ""} ${
              isDisabled ? "disabled" : ""
            }`}
            key={day.getTime()}
            onClick={() => {
              if(!isDisabled) {
                  setSelectedDate(cloneDay);
                  setSelectedTime(null);
              }
            }}
          >
            {format(day, 'd')}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="calendar-grid" key={day.getTime()}>
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  const handleReschedule = async () => {
     setRescheduling(true);
     try {
       const start = parse(selectedTime!, 'HH:mm', selectedDate!);
       const end = addMinutes(start, meeting.eventType.duration);
       
       await api.rescheduleMeeting(meetingId!, {
          startTime: start.toISOString(),
          endTime: end.toISOString()
       });
       alert("Meeting successfully rescheduled! Confirmation email sent.");
       navigate('/');
     } catch (err: any) {
        alert(err.message || 'Failed to reschedule');
     } finally {
        setRescheduling(false);
     }
  };

  if(!meeting) return <div className="text-center mt-12 text-gray">Loading...</div>;

  const slots = selectedDate ? generateTimeSlots(selectedDate) : [];
  const eventType = meeting.eventType;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
       <div className="card flex flex-col md:flex-row shadow-lg" style={{ width: '100%', maxWidth: '1060px', padding: 0, overflow: 'hidden' }}>
          <div style={{ width: '100%', maxWidth: '330px', padding: '2rem', borderRight: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
             <Link to="/" className="text-primary font-medium flex items-center gap-2 mb-6" style={{ textDecoration: 'none' }}><ArrowLeft size={16}/> Back to Dashboard</Link>
             <h1 className="text-2xl font-bold mb-2">Reschedule Event</h1>
             <p className="text-gray mb-6">Original: {format(new Date(meeting.startTime), 'MMM d, h:mm a')}</p>
             
             <h2 className="text-lg font-bold mb-4">{eventType.name}</h2>
             <div className="text-gray flex flex-col gap-3 font-medium">
                <div className="flex items-center gap-3"><Clock size={18}/> {eventType.duration} min</div>
                <div className="flex items-center gap-3"><Video size={18}/> Web conferencing details provided upon confirmation.</div>
                {selectedDate && selectedTime && (
                  <div className="flex items-center gap-3 mt-4" style={{ color: 'var(--primary-color)' }}>
                     <Cal size={18} />
                     {format(parse(selectedTime, 'HH:mm', selectedDate), 'h:mm a')} - {format(addMinutes(parse(selectedTime, 'HH:mm', selectedDate), eventType.duration), 'h:mm a')}, {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                )}
             </div>
          </div>
          
          <div style={{ flex: 1, padding: '2rem', background: '#fff' }}>
             <div className="flex gap-8" style={{ flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                <div style={{ flex: 2 }}>
                   <h2 className="text-xl font-bold mb-6">Select a New Date & Time</h2>
                   <div className="flex justify-between items-center mb-4">
                      <div className="font-bold">{format(currentMonth, "MMMM yyyy")}</div>
                      <div className="flex gap-2">
                        <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', background: 'rgba(0,107,255,0.05)' }} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ArrowLeft size={18}/></button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', background: 'rgba(0,107,255,0.05)' }} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ArrowRight size={18}/></button>
                      </div>
                   </div>
                   <div className="calendar-grid mb-2">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="calendar-day-header">{d}</div>)}
                   </div>
                   {renderCalendar()}
                   <div className="mt-8 font-medium text-sm flex items-center justify-start gap-2 text-gray"><Globe size={16}/> {Intl.DateTimeFormat().resolvedOptions().timeZone} ({format(new Date(), 'h:mm a')})</div>
                </div>
                
                {selectedDate && (
                  <div style={{ flex: 1, maxHeight: '420px', overflowY: 'auto', paddingRight: '10px' }}>
                     <h3 className="font-medium mb-4">{format(selectedDate, "EEEE, MMMM d")}</h3>
                     <div className="flex flex-col gap-2">
                        {slots.length === 0 ? (
                          <div className="text-gray text-sm">No times available</div>
                        ) : slots.map(time => (
                          selectedTime === time ? (
                            <div key={time} className="flex gap-2">
                               <button className="time-slot selected" style={{ flex: 1, marginBottom: 0 }}>{time}</button>
                               <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReschedule} disabled={rescheduling}>{rescheduling ? "Wait..." : "Confirm"}</button>
                            </div>
                          ) : (
                            <button key={time} className="time-slot" onClick={() => setSelectedTime(time)}>{time}</button>
                          )
                        ))}
                     </div>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}
