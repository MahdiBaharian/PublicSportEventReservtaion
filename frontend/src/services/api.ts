const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const customFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const res = await fetch(url, options);

    if (res.status === 401 && !url.includes('login')) {
      localStorage.removeItem('access');
      window.location.href = '/login';
      return { error: 'احراز هویت نیازه' };
    }

    return await res.json();
  } catch (error) {
    return { error: 'خطا در ارتباط با سرور' };
  }
};

export const authApi = {
  signup: async (data: any) => customFetch(`${API_BASE_URL}/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  login: async (data: any) => customFetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  verifyOtp: async (data: any) => customFetch(`${API_BASE_URL}/auth/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  sendOtp: async (data: any) => customFetch(`${API_BASE_URL}/auth/send-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  forgetPassword: async (data: any) => customFetch(`${API_BASE_URL}/auth/forget-password/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const userApi = {
  getProfile: async () => customFetch(`${API_BASE_URL}/profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
  }),

  updateProfile: async (data: any) => customFetch(`${API_BASE_URL}/profile/update/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify(data),
  }),
};

export const ticketApi = {
  getLocations: async () => customFetch(`${API_BASE_URL}/locations/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),

  search: async (params: Record<string, string>) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value.trim() !== '') {
        queryParams.append(key, value);
      }
    });

    return customFetch(`${API_BASE_URL}/tickets/search/?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  getDetails: async (ticketId: string) => customFetch(`${API_BASE_URL}/tickets/${ticketId}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }),

  reserve: async (data: { ticket_id: number; quantity: number; seat_info: string }) => customFetch(`${API_BASE_URL}/reservations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify(data),
  }),

  getReservations: async () => customFetch(`${API_BASE_URL}/user/bookings/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
  }),

  cancelReservation: async (reservationId: number) => customFetch(`${API_BASE_URL}/reservations/${reservationId}/cancel/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
  }),

  payReservation: async (reservationId: number) => customFetch(`${API_BASE_URL}/payments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify({ reservation_id: reservationId }),
  }),

  checkPenalty: async (reservationId: number) => customFetch(`${API_BASE_URL}/reservations/${reservationId}/cancel-penalty/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
  }),

  cancelPaidReservation: async (reservationId: number) => customFetch(`${API_BASE_URL}/reservations/${reservationId}/cancel-penalty/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
  }),

  submitReport: async (reservationId: number, reportType: string, description: string) => customFetch(`${API_BASE_URL}/reservations/${reservationId}/report/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify({ report_type: reportType, description }),
  }),
};

export const adminApi = {
  login: async (data: any) => customFetch(`${API_BASE_URL}/auth/admin-login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  getReports: async () => customFetch(`${API_BASE_URL}/admin/management/?action=reports`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
  }),

  getReservations: async () => customFetch(`${API_BASE_URL}/admin/management/?action=reservations`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
  }),

  getCancellations: async () => customFetch(`${API_BASE_URL}/admin/management/?action=cancellations`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
  }),

  getUsers: async () => customFetch(`${API_BASE_URL}/admin/management/?action=users`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
  }),

  updateReport: async (id: number, status: string, reply?: string) => customFetch(`${API_BASE_URL}/admin/management/`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify({ target: 'report', id, status, reply })
  }),

  updateReservationStatus: async (id: number, status: string) => customFetch(`${API_BASE_URL}/admin/management/`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify({ target: 'reservation', id, status })
  }),

  createTicket: async (data: any) => customFetch(`${API_BASE_URL}/ticket-management/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access')}`
    },
    body: JSON.stringify(data)
  })
};