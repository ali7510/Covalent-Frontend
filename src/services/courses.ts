import api from "./api";
import type {
  CourseRegistrationResponse,
  RegisterCourseBody,
  UpdateCourseBody,
  CourseCatalogWrapper,
  GradeMappingWrapper,
} from "../lib/types";

const BASE = "/api/v1/courses";

// ---------------------------------------------------------------------------
// Get courses currently being taken (isCurrent: true / closed: false)
// ---------------------------------------------------------------------------
export async function getCurrentCourses(): Promise<CourseRegistrationResponse[]> {
  const res = await api.get(`${BASE}/current`);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Get all registered courses (current + past)
// ---------------------------------------------------------------------------
export async function getAllCourses(): Promise<CourseRegistrationResponse[]> {
  const res = await api.get(BASE);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Register a new course
// ---------------------------------------------------------------------------
export async function registerCourse(
  body: RegisterCourseBody
): Promise<CourseRegistrationResponse> {
  const res = await api.post(BASE, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Update a course registration (termWork, examWork, closed flag)
// ---------------------------------------------------------------------------
export async function updateCourse(
  id: string,
  body: UpdateCourseBody
): Promise<CourseRegistrationResponse> {
  const res = await api.patch(`${BASE}/${id}`, body);
  return res.data.data;
}

// ---------------------------------------------------------------------------
// Delete a course registration
// ---------------------------------------------------------------------------
export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`${BASE}/${id}`);
}

// ---------------------------------------------------------------------------
// Reference Data Endpoints
// ---------------------------------------------------------------------------
export async function getCourseCatalog(): Promise<CourseCatalogWrapper> {
  const res = await api.get("/api/v1/reference-data/courses");
  return res.data.data;
}

export async function getGradeMapping(): Promise<GradeMappingWrapper> {
  const res = await api.get("/api/v1/reference-data/grades");
  return res.data.data;
}