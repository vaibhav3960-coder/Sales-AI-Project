const API_BASE = 'http://localhost:3001/api';

export const api = {
  getEventTypes: () => fetch(`${API_BASE}/event-types`).then(r => r.json()),
  createEventType: (data: any) => fetch(`${API_BASE}/event-types`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  updateEventType: (id: string, data: any) => fetch(`${API_BASE}/event-types/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(r => r.json()),
  deleteEventType: (id: string) => fetch(`${API_BASE}/event-types/${id}`, { method: 'DELETE' }).then(r => r.json()),
  
  getAvailability: () => fetch(`${API_BASE}/availability`).then(r => r.json()),
  updateAvailability: (availabilities: any) => fetch(`${API_BASE}/availability`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ availabilities }) }).then(r => r.json()),
  
  getMeetings: () => fetch(`${API_BASE}/meetings`).then(r => r.json()),
  getMeeting: (id: string) => fetch(`${API_BASE}/meetings/${id}`).then(r => r.json()),
  cancelMeeting: (id: string) => fetch(`${API_BASE}/meetings/${id}/cancel`, { method: 'POST' }).then(r => r.json()),
  bookMeeting: (data: any) => fetch(`${API_BASE}/meetings`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(r => {
    if(!r.ok) { return r.json().then(e => {throw new Error(e.error)}) }
    return r.json();
  }),
  rescheduleMeeting: (id: string, data: any) => fetch(`${API_BASE}/meetings/${id}/reschedule`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(r => {
    if(!r.ok) { return r.json().then(e => {throw new Error(e.error)}) }
    return r.json();
  })
};
