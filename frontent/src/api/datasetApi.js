const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://localhost:5000";

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload dataset: ${res.status}`);
  }

  return res.json(); // returns dataset doc (including _id, fields, sampleRows)
}

export async function fetchDataset(datasetId) {
  const res = await fetch(`${API_BASE_URL}/api/datasets/${datasetId}`);
  if (!res.ok) throw new Error(`Failed to fetch dataset: ${res.status}`);
  return res.json();
}

export async function fetchDatasetRows(datasetId, limit) {
  const url =
    typeof limit === "number"
      ? `${API_BASE_URL}/api/datasets/${datasetId}/rows?limit=${limit}`
      : `${API_BASE_URL}/api/datasets/${datasetId}/rows`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch dataset rows: ${res.status}`);
  return res.json(); // { rows, rowCount }
}
