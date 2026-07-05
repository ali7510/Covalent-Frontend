import api from "./api";
import type {
  MaterialResponse,
  ShareLinkBody,
  UpdateMaterialBody,
  SearchMaterialsParams,
  PagedResponse,
} from "../lib/types";

const BASE = "/api/v1/materials";

// ---------------------------------------------------------------------------
// Get paginated materials for a space (query-param pagination)
// ---------------------------------------------------------------------------
export async function getSpaceMaterials(
  spaceId: string,
  page = 0,
  size = 20
): Promise<PagedResponse<MaterialResponse>> {
  const res = await api.get(`${BASE}/space/${spaceId}/paged`, {
    params: { page, size },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get bookmarked materials in a space
// ---------------------------------------------------------------------------
export async function getBookmarkedMaterials(
  spaceId: string,
  page = 0,
  size = 20
): Promise<PagedResponse<MaterialResponse>> {
  const res = await api.get(`${BASE}/space/${spaceId}/bookmarked`, {
    params: { page, size },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Search materials in a space
// ---------------------------------------------------------------------------
export async function searchMaterials(
  spaceId: string,
  params: SearchMaterialsParams
): Promise<MaterialResponse[]> {
  const res = await api.get(`${BASE}/space/${spaceId}/search`, {
    params: {
      query: params.query,
      resourceType: params.resourceType,
      sortBy: params.sortBy ?? "createdAt",
      sortDir: params.sortDir ?? "desc",
    },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Upload a file material (multipart/form-data)
//
// Accepted types: PDF, DOC, DOCX, TXT, MD
// ---------------------------------------------------------------------------
export async function uploadFile(
  spaceId: string,
  title: string,
  file: File,
  description?: string
): Promise<MaterialResponse> {
  const formData = new FormData();
  formData.append("spaceId", spaceId);
  formData.append("title", title);
  if (description) formData.append("description", description);
  formData.append("file", file);

  const res = await api.post(`${BASE}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Share a link material
// ---------------------------------------------------------------------------
export async function shareLink(
  spaceId: string,
  body: ShareLinkBody
): Promise<MaterialResponse> {
  const res = await api.post(`${BASE}/link`, body, {
    params: { spaceId },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Toggle bookmark on a material
// ---------------------------------------------------------------------------
export async function bookmarkMaterial(materialId: string): Promise<void> {
  await api.post(`${BASE}/${materialId}/bookmark`);
}

export async function removeBookmark(materialId: string): Promise<void> {
  await api.delete(`${BASE}/${materialId}/bookmark`);
}

// ---------------------------------------------------------------------------
// Download a file material
// Returns a Blob so callers can create an object URL for the browser
// ---------------------------------------------------------------------------
export async function downloadMaterial(materialId: string): Promise<Blob> {
  const res = await api.get(`${BASE}/${materialId}/download`, {
    responseType: "blob",
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Edit a material (title / description)
// ---------------------------------------------------------------------------
export async function updateMaterial(
  materialId: string,
  body: UpdateMaterialBody
): Promise<MaterialResponse> {
  const res = await api.patch(`${BASE}/${materialId}`, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get a single material by ID
// ---------------------------------------------------------------------------
export async function getMaterialById(materialId: string): Promise<MaterialResponse> {
  const res = await api.get(`${BASE}/${materialId}`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Delete a material (uploader only)
// ---------------------------------------------------------------------------
export async function deleteMaterial(materialId: string): Promise<void> {
  await api.delete(`${BASE}/${materialId}`);
}