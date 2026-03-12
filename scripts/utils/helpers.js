function debounce(fn, delay = 300) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getStatusClass(status) {
  switch (status) {
    case "Approved":
      return "status-approved";
    case "Waitlisted":
      return "status-waitlisted";
    case "Rejected":
      return "status-rejected";
    default:
      return "status-awaiting";
  }
}

function sortApplications(data, direction) {
  return [...data].sort((a, b) => {
    const nameA = a.vendor.toLowerCase();
    const nameB = b.vendor.toLowerCase();

    if (direction === "asc") {
      return nameA.localeCompare(nameB);
    }

    return nameB.localeCompare(nameA);
  });
}
