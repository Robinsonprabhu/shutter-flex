const API_BASE = '/api';

// In-flight request deduplication and TTL-based client cache
const requestCache = new Map();
const inFlightRequests = new Map();

const cachedFetch = async (url, options = {}, ttlMs = 4000) => {
  const cacheKey = `${options.method || 'GET'}:${url}`;

  // Check TTL cache for GET requests
  if (!options.method || options.method === 'GET') {
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data;
    }

    // Check if duplicate request is already in-flight
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        const errorMsg = data?.message || `HTTP Error ${res.status}: ${res.statusText}`;
        const error = new Error(errorMsg);
        error.status = res.status;
        error.data = data;
        throw error;
      }

      if (!options.method || options.method === 'GET') {
        requestCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  if (!options.method || options.method === 'GET') {
    inFlightRequests.set(cacheKey, promise);
  }

  return promise;
};

export const clearApiCache = (pattern) => {
  if (!pattern) {
    requestCache.clear();
    return;
  }
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
};

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
    clearApiCache();
    const res = await fetch(`${API_BASE}/participants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  participantLogin: async (name) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/participants/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    return handleResponse(res);
  },

  getParticipantMe: async () => {
    return cachedFetch(`${API_BASE}/participants/me`, {
      headers: getAuthHeaders(),
    }, 10000);
  },

  // Participant Submissions
  getMySubmissions: async () => {
    return cachedFetch(`${API_BASE}/submissions/my`, {
      headers: getAuthHeaders(),
    }, 3000);
  },

  uploadSubmission: (formData, onProgress) => {
    clearApiCache();
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
            clearApiCache();
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
    return cachedFetch(`${API_BASE}/submissions/exhibition/public`, {}, 8000);
  },

  // Admin Auth
  adminLogin: async (email, password) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getAdminMe: async () => {
    return cachedFetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
    }, 30000);
  },

  // Admin Stats & Submissions
  getAdminStats: async (forceFresh = false) => {
    if (forceFresh) clearApiCache('admin/stats');
    return cachedFetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    }, 2500);
  },

  getAdminSubmissions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return cachedFetch(`${API_BASE}/admin/submissions?${query}`, {
      headers: getAuthHeaders(),
    }, 2000);
  },

  getAdminSubmissionById: async (id) => {
    return cachedFetch(`${API_BASE}/admin/submissions/${id}`, {
      headers: getAuthHeaders(),
    }, 5000);
  },

  updateSubmissionStatus: async (id, status) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  updateSubmissionScore: async (id, score) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/score`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ score }),
    });
    return handleResponse(res);
  },

  updateSubmissionComment: async (id, judgeComment) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/comment`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ judgeComment }),
    });
    return handleResponse(res);
  },

  setSubmissionWinner: async (id, isWinner) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/submissions/${id}/winner`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isWinner }),
    });
    return handleResponse(res);
  },

  deleteSubmission: async (id) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Participants Management
  getAdminParticipants: async () => {
    return cachedFetch(`${API_BASE}/admin/participants`, {
      headers: getAuthHeaders(),
    }, 3000);
  },

  createAdminParticipant: async (participantData) => {
    clearApiCache();
    const res = await fetch(`${API_BASE}/admin/participants`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(participantData),
    });
    return handleResponse(res);
  },
};
