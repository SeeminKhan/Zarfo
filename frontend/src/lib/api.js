const BASE_URL = "http://localhost:5000/api";

// Custom error class that mirrors what axios threw so callers need minimal changes
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    // Expose response.data so existing catch blocks using err.response?.data still work
    this.response = { data, status };
  }
}

async function request(method, path, { body, params, isFormData = false } = {}) {
  const token = localStorage.getItem("zarfo_token");

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body) headers["Content-Type"] = "application/json";

  let url = `${BASE_URL}${path}`;
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include", // sends HttpOnly cookies (refresh token)
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // Parse response body — try JSON first, fall back to text
  let data;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      (typeof data === "object" && (data?.error || data?.message)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, data);
  }

  return { data };
}

const api = {
  get: (path, { params } = {}) => request("GET", path, { params }),
  post: (path, body, { headers } = {}) => {
    const isFormData = body instanceof FormData;
    return request("POST", path, { body, isFormData });
  },
  put: (path, body) => request("PUT", path, { body }),
  patch: (path, body) => request("PATCH", path, { body }),
  delete: (path) => request("DELETE", path),
};

export default api;
