const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Custom error class — keeps err.response.data compatible with old axios catch blocks
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = { data, status };
  }
}

async function request(method, path, { body, params, isFormData = false } = {}) {
  // Guard: path must start with "/" and must not contain the method name
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new TypeError(`api: invalid path "${path}". Must be a string starting with "/".`);
  }

  const token = localStorage.getItem("zarfo_token");

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData && body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
  }

  // Build URL — never let method bleed into the URL string
  let url = `${BASE_URL}${path}`;
  if (params && typeof params === "object" && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method: method.toUpperCase(),          // always uppercase, never in the URL
    headers,
    credentials: "include",               // sends HttpOnly refresh-token cookie
    body: isFormData
      ? body
      : body !== undefined && body !== null
        ? JSON.stringify(body)
        : undefined,
  });

  // Parse response — JSON first, plain text fallback
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
  get:    (path, { params } = {})  => request("GET",    path, { params }),
  post:   (path, body)             => request("POST",   path, { body, isFormData: body instanceof FormData }),
  put:    (path, body)             => request("PUT",    path, { body }),
  patch:  (path, body)             => request("PATCH",  path, { body }),
  delete: (path)                   => request("DELETE", path),
};

export default api;
