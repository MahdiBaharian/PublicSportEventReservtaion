const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const authApi = {
  signup: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  verifyOtp: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  sendOtp: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  forgetPassword: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/forget-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export const userApi = {
  getProfile: async () => {
    const token = localStorage.getItem('access');
    const res = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return res.json();
  },

  updateProfile: async (data: any) => {
    const token = localStorage.getItem('access');
    const res = await fetch(`${API_BASE_URL}/profile/update/`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export const ticketApi = {
  getLocations: async () => {
    const res = await fetch(`${API_BASE_URL}/locations/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  search: async (params: Record<string, string>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value.trim() !== '') {
        queryParams.append(key, value);
      }
    });

    const res = await fetch(`${API_BASE_URL}/tickets/search/?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  getDetails: async (ticketId: string) => {
    const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  reserve: async (data: { ticket_id: number; quantity: number; seat_info: string }) => {
    const token = localStorage.getItem('access');
    const res = await fetch(`${API_BASE_URL}/reservations/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getReservations: async () => {
    const token = localStorage.getItem('access');
    const res = await fetch(`${API_BASE_URL}/user/bookings/`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return res.json();
  },

  cancelReservation: async (reservationId: number) => {
    const token = localStorage.getItem('access');
    const res = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    return res.json();
  },

  payReservation: async (reservationId: number) => {
    const token = localStorage.getItem('access');
    const res = await fetch(`${API_BASE_URL}/payments/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reservation_id: reservationId }),
    });
    return res.json();
  }
};