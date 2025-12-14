const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

export async function fetchDashboardByDataset(datasetId, userId = null) {
  const url = new URL(`${API_BASE_URL}/api/dashboards/by-dataset/${datasetId}`);
  if (userId) url.searchParams.set("userId", userId);

  const res = await fetch(url.toString());
  if (!res.ok)
    throw new Error(`Failed to fetch dashboard config: ${res.status}`);

  return res.json();
}

export async function saveDashboardByDataset(
  datasetId,
  { widgets, name, dateRange, userId = null }
) {
  const res = await fetch(
    `${API_BASE_URL}/api/dashboards/by-dataset/${datasetId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widgets, name, dateRange, userId }),
    }
  );

  if (!res.ok)
    throw new Error(`Failed to save dashboard config: ${res.status}`);

  return res.json();
}
