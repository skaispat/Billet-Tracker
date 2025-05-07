// Utility function to conditionally join class names
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

// Format date function
export function formatDate(dateString) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
