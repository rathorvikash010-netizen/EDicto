/**
 * Standard API response helper.
 * Ensures consistent JSON shape across all endpoints.
 */
class ApiResponse {
  static success(res, { statusCode = 200, message = 'Success', data = null, meta = null } = {}) {
    const body = { success: true, message };
    if (data !== null) body.data = data;
    if (meta !== null) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created(res, { message = 'Created successfully', data = null } = {}) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
