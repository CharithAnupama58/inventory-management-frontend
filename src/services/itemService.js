import api from "./api";

const ItemService = {
  /**
   * Get all items with optional filters
   * @param {Object} params - { search, status, cupboard_id, place_id, page }
   */
  async getAll(params = {}) {
    const response = await api.get("/items", { params });
    return response.data;
  },

  /**
   * Get single item by ID
   */
  async getById(id) {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },

  /**
   * Create new item (admin only)
   * Handles image upload via FormData
   */
  async create(data) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await api.post("/items", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  /**
   * Update item (admin only)
   */
  async update(id, data) {
    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel method spoofing for multipart
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await api.post(`/items/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  },

  /**
   * Delete item (admin only)
   */
  async delete(id) {
    await api.delete(`/items/${id}`);
  },

  /**
   * Update item status (admin only)
   * @param {string} status - instore | damaged | missing
   */
  async updateStatus(id, status) {
    const response = await api.patch(`/items/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Adjust item quantity (admin only)
   * @param {string} action - increment | decrement | set
   * @param {number} amount
   */
  async adjustQuantity(id, action, amount) {
    const response = await api.patch(`/items/${id}/quantity`, { action, amount });
    return response.data.data;
  },
};

export default ItemService;