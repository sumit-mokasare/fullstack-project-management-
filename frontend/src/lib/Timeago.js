// "an hour ago", "2 days ago", "a month ago" ...
export function timeAgo(value) {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";

  const steps = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [name, size] of steps) {
    const n = Math.floor(seconds / size);
    if (n >= 1) {
      if (n === 1) return `${name === "hour" ? "an" : "a"} ${name} ago`;
      return `${n} ${name}s ago`;
    }
  }
  return "just now";
}
