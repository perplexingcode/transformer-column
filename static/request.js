export async function request(path, _options = {}) {
  const { backendUrl, token } = useRuntimeConfig().public;
  let options = {
    method: _options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  };
  if (_options?.header) {
    options.headers = { ...options.headers, ..._options.headers };
  }
  options = { ...options, ..._options };
  if (options.method === 'GET') delete options?.body;
  if (options?.noCors) options.mode = 'no-cors';
  if (options?.noHeaders) delete options.headers;
  if (!path.includes('http')) path = backendUrl + '/' + path;
  return await useFetch(path, options);
}

export async function get(path, options) {
  const resp = await request(path, { ...options, method: 'GET' });
  const data = resp?.data;
  if (!data) {
    console.error(data.error);
    return null;
  }
  try {
    return JSON.parse(data._rawValue);
  } catch (e) {
    return data._rawValue;
  }
}

export async function post(path, options) {
  const resp = await request(path, { ...options, method: 'POST' });
  const data = resp?.data;
  if (!data) {
    console.error(data.error);
    return null;
  }
  try {
    return JSON.parse(data._rawValue);
  } catch (e) {
    return data._rawValue;
  }
}

export function fetchWrapper(data) {
  if (!data._rawValue) return ref([]);
  return data;
}
