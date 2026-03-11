import api from "./api";

const BorrowService = {
  /**
   * Get all borrows — admin only
   * @param {Object} params - { search, status, overdue, page }
   */
  async getAll(params = {}) {
    const response = await api.get("/borrows", { params });
    return response.data;
  },

  /**
   * Get logged-in staff member's own borrows
   * @param {Object} params - { status, page }
   */
  async getMyBorrows(params = {}) {
    const response = await api.get("/my-borrows", { params });
    return response.data;
  },

  /**
   * Get single borrow by ID — admin only
   */
  async getById(id) {
    const response = await api.get(`/borrows/${id}`);
    return response.data.data;
  },

  /**
   * Create a new borrow record
   * @param {Object} data - { item_id, borrower_name, contact, quantity,
   *                          borrow_date, expected_return_date, notes }
   */
  async create(data) {
    const response = await api.post("/borrows", data);
    return response.data.data;
  },

  /**
   * Process a return — admin only
   * @param {number} id - borrow ID
   * @param {Object} data - { return_condition, notes }
   */
  async processReturn(id, data) {
    const response = await api.patch(`/borrows/${id}/return`, data);
    return response.data.data;
  },
};

export default BorrowService;