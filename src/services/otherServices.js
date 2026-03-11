import api from "./api";

/* ════════════════════════════════════════
   User Service — admin only
════════════════════════════════════════ */
export const UserService = {
  async getAll(params = {}) {
    const response = await api.get("/users", { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await api.post("/users", data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    await api.delete(`/users/${id}`);
  },

  async toggleStatus(id) {
    const response = await api.patch(`/users/${id}/toggle-status`);
    return response.data.data;
  },
};

/* ════════════════════════════════════════
   Cupboard Service
════════════════════════════════════════ */
export const CupboardService = {
  async getAll() {
    const response = await api.get("/cupboards");
    return response.data.data;
  },

  async getById(id) {
    const response = await api.get(`/cupboards/${id}`);
    return response.data.data;
  },

  async create(data) {
    const response = await api.post("/cupboards", data);
    return response.data.data;
  },

  async update(id, data) {
    const response = await api.put(`/cupboards/${id}`, data);
    return response.data.data;
  },

  async delete(id) {
    await api.delete(`/cupboards/${id}`);
  },

  // Places
  async createPlace(cupboardId, data) {
    const response = await api.post(`/cupboards/${cupboardId}/places`, data);
    return response.data.data;
  },

  async updatePlace(placeId, data) {
    const response = await api.put(`/places/${placeId}`, data);
    return response.data.data;
  },

  async deletePlace(placeId) {
    await api.delete(`/places/${placeId}`);
  },
};

/* ════════════════════════════════════════
   Audit Log Service — admin only
════════════════════════════════════════ */
export const AuditLogService = {
  async getAll(params = {}) {
    const response = await api.get("/audit-logs", { params });
    return response.data;
  },
};