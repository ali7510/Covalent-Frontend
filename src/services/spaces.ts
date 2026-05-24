import api from "./api";
import type {
  SpaceResponse,
  MembershipResponse,
  CreateSpaceBody,
  SearchSpacesParams,
  PagedResponse,
} from "../lib/types";

const BASE = "/api/v1/spaces";

// ---------------------------------------------------------------------------
// Get all spaces the authenticated user belongs to
// ---------------------------------------------------------------------------
export async function getUserSpaces(): Promise<SpaceResponse[]> {
  const res = await api.get(`${BASE}/all-spaces`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Browse active (public) spaces with optional pagination
// ---------------------------------------------------------------------------
export async function getActiveSpaces(
  page = 0,
  size = 20
): Promise<PagedResponse<SpaceResponse>> {
  const res = await api.get(`${BASE}/active-spaces`, { params: { page, size } });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Search spaces with filters and sorting
// ---------------------------------------------------------------------------
export async function searchSpaces(
  params: SearchSpacesParams
): Promise<PagedResponse<SpaceResponse>> {
  const res = await api.get(`${BASE}/search`, {
    params: {
      query: params.query,
      category: params.category,
      sortBy: params.sortBy ?? "createdAt",
      sortDir: params.sortDir ?? "desc",
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get details of a single space
// ---------------------------------------------------------------------------
export async function getSpace(spaceId: string): Promise<SpaceResponse> {
  const res = await api.get(`${BASE}/${spaceId}`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Create a space
//
// When force = false (default) the backend may return 409 Conflict with a
// list of similar spaces in the response body.  The caller is responsible
// for catching the AxiosError, inspecting error.response.status === 409,
// and re-calling with force = true after user confirmation.
//
//   try {
//     await createSpace(body);
//   } catch (err) {
//     if (isAxiosError(err) && err.response?.status === 409) {
//       const similar: SpaceResponse[] = err.response.data.data;
//       // show dialog, then: await createSpace(body, true)
//     }
//   }
// ---------------------------------------------------------------------------
export async function createSpace(
  body: CreateSpaceBody,
  force = false
): Promise<SpaceResponse> {
  const res = await api.post(`${BASE}`, body, {
    params: { force: force ? 1 : 0 },
  });
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Join a space the user is not yet a member of
// ---------------------------------------------------------------------------
export async function joinSpace(spaceId: string): Promise<MembershipResponse> {
  const res = await api.post(`${BASE}/${spaceId}/join`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Leave a space the user is currently a member of
// ---------------------------------------------------------------------------
export async function leaveSpace(spaceId: string): Promise<void> {
  await api.delete(`${BASE}/${spaceId}/leave`);
}