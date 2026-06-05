export function getQueryParam(name: string): string | null {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const fromSearch = urlParams.get(name);
  if (fromSearch) return fromSearch;

  const overridePath = urlParams.get("p");
  const pathSource =
    typeof overridePath === "string" && overridePath.length > 0
      ? overridePath
      : window.location.pathname;
  const pathParts = pathSource
    .split("/")
    .filter((part) => part.length > 0);
  const normalized = name.toLowerCase();

  for (let i = 0; i < pathParts.length; i += 1) {
    const part = pathParts[i];
    const lower = part.toLowerCase();
    if (lower === normalized && pathParts[i + 1]) {
      return decodeURIComponent(pathParts[i + 1]);
    }
    if (part.includes("=")) {
      const [key, value] = part.split("=");
      if (key?.toLowerCase() === normalized && value) {
        return decodeURIComponent(value);
      }
    }
  }

  const rawHash = window.location.hash || "";
  const hash = rawHash.startsWith("#") ? rawHash.slice(1) : rawHash;
  const hashQuery = hash.includes("?")
    ? hash.split("?")[1]
    : hash.includes("=")
      ? hash
      : "";
  if (!hashQuery) return null;

  const hashParams = new URLSearchParams(hashQuery);
  return hashParams.get(name);
}

export function getBooleanQueryParam(name: string): boolean {
  const value = getQueryParam(name);
  return value === "1" || value === "true";
}
