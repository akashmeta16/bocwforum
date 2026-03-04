export function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  let hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  const ampm = hour >= 12 ? "PM" : "AM";
  hour %= 12;
  if (hour === 0) hour = 12;

  return `${month}/${day}/${year} ${hour}:${minute}:${second} ${ampm}`;
}

export function parseDate(value) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
