const jsonCache = new Map();

export async function loadJson(path) {
  if (jsonCache.has(path)) {
    return jsonCache.get(path);
  }

  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }

  const payload = await response.json();
  jsonCache.set(path, payload);
  return payload;
}
