const API_BASE = (import.meta.env.VITE_API_URL || 'https://sales-ai-project.onrender.com') + '/api';

const handleResponse = async (r: Response) => {
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${r.status}`);
  }
  return r.json();
};

export const api = {
  getEventTypes: () => fetch(`${API_BASE}/event-types`).then(handleResponse),
  createEventType: (data: any) => fetch(`${API_BASE}/event-types`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(handleResponse),
  updateEventType: (id: string, data: any) => fetch(`${API_BASE}/event-types/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(handleResponse),
  deleteEventType: (id: string) => fetch(`${API_BASE}/event-types/${id}`, { method: 'DELETE' }).then(handleResponse),
  
  getAvailability: () => fetch(`${API_BASE}/availability`).then(handleResponse),
  updateAvailability: (availabilities: any) => fetch(`${API_BASE}/availability`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ availabilities }) }).then(handleResponse),
  
  getSettings: () => fetch(`${API_BASE}/settings`).then(handleResponse),
  updateSettings: (settings: any) => fetch(`${API_BASE}/settings`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ settings }) }).then(handleResponse),
  
  getMeetings: () => fetch(`${API_BASE}/meetings`).then(handleResponse),
  getMeeting: (id: string) => fetch(`${API_BASE}/meetings/${id}`).then(handleResponse),
  cancelMeeting: (id: string) => fetch(`${API_BASE}/meetings/${id}/cancel`, { method: 'POST' }).then(handleResponse),
  bookMeeting: (data: any) => fetch(`${API_BASE}/meetings`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(handleResponse),
  rescheduleMeeting: (id: string, data: any) => fetch(`${API_BASE}/meetings/${id}/reschedule`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }).then(handleResponse),
  seedDatabase: () => fetch(`${API_BASE}/seed`, { method: 'POST' }).then(handleResponse)
};
