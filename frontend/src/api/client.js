const API_BASE = '/api';

const getAuthHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('shutter_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || `HTTP Error ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Participant Auth & On-Spot Registration
  participantRegister: async (data) => {
    const res = await fetch(`${API_BASE}/participants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  participantLogin: async (name) => {
    const res = await fetch(`${API_BASE}/participants/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  getParticipantMe: async () => {
    const res = await fetch(`${API_BASE}/participants/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Participant Submissions
  getMySubmissions: async () => {
    const res = await fetch(`${API_BASE}/submissions/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  uploadSubmission: (formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/submissions`);

      const token = localStorage.getItem('shutter_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.message || `Upload failed with status ${xhr.status}`));
          }
        } catch (e) {
          reject(new Error('Invalid response received from server.'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during photo upload.'));
      };

      xhr.send(formData);
    });
  },

  // Public Exhibition
  getPublicExhibition: async () => {
    const res = await fetch(`${API_BASE}/submissions/exhibition/public`);
    return handleResponse(res);
  },

  // Admin Auth
  adminLogin: async (email, password) => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getAdminMe: async () => {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Stats & Submissions
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAdminSubmissions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/submissions?${query}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAdminSubmissionById: async (id) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateSubmissionStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  updateSubmissionScore: async (id, score) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/score`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ score }),
    });
    return handleResponse(res);
  },

  updateSubmissionComment: async (id, judgeComment) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/comment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ judgeComment }),
    });
    return handleResponse(res);
  },

  setSubmissionWinner: async (id, isWinner) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/winner`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isWinner }),
    });
    return handleResponse(res);
  },

  deleteSubmission: async (id) => {
    const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Participants Management
  getAdminParticipants: async () => {
    const res = await fetch(`${API_BASE}/admin/participants`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  createAdminParticipant: async (participantData) => {
    const res = await fetch(`${API_BASE}/admin/participants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(participantData),
    });
    return handleResponse(res);
  },
};
