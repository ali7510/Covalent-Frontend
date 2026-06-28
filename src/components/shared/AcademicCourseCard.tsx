import { BookOpen, CheckCircle, Clock, Edit, Trash2 } from "lucide-react"
import type { CourseRegistrationResponse } from "@/lib/types"

interface AcademicCourseCardProps {
  course: CourseRegistrationResponse
  courseName?: string
  onEdit?: (course: CourseRegistrationResponse) => void
  onDelete?: (courseId: string) => void
}

function parseCourseCode(code: string) {
  const match = code.match(/\d+/);
  const numericPart = match ? match[0] : "";
  if (numericPart.length >= 3) {
    const year = parseInt(numericPart[0], 10);
    const semester = parseInt(numericPart[1], 10);
    return { year, semester };
  }
  return { year: 1, semester: 1 };
}

function gradeColor(grade?: string | null) {
  if (!grade) return "text-muted-foreground bg-muted border-border"
  const g = grade.toUpperCase()
  if (g.startsWith("A")) return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800"
  if (g.startsWith("B")) return "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800"
  if (g.startsWith("C")) return "text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800"
  return "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800"
}

export default function AcademicCourseCard({ course, courseName, onEdit, onDelete }: AcademicCourseCardProps) {
  const isCompleted = course.closed && !!course.grade
  const { year, semester } = parseCourseCode(course.code)

  return (
    <div className="bg-card border border-border rounded-md shadow-card-light dark:shadow-card-dark p-5 hover:border-primary/30 transition-all duration-150 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-md border shrink-0 bg-secondary border-border`}>
            {isCompleted
              ? <CheckCircle className="h-4 w-4 text-emerald-500" />
              : <BookOpen className="h-4 w-4 text-primary" />
            }
          </div>
          <div className="min-w-0">
            <h4 className="text-[14px] font-[510] text-foreground leading-snug line-clamp-1">
              {courseName || course.code}
            </h4>
            <p className="text-[12px] text-muted-foreground font-normal mt-0.5">
              {course.code}
            </p>
          </div>
        </div>

        {/* Grade badge */}
        {course.grade ? (
          <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-[510] ${gradeColor(course.grade)}`}>
            {course.grade}
          </span>
        ) : (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[12px] font-normal text-muted-foreground">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-normal flex-wrap">
        <span className="flex items-center gap-1">
          <span className="font-[510] text-foreground">Year {year}</span>
        </span>
        <span className="w-px h-3 bg-border" />
        <span>Semester {semester}</span>
        {course.result != null && (
          <>
            <span className="w-px h-3 bg-border" />
            <span>Score: <span className="font-[510] text-foreground">{course.result.toFixed(1)}%</span></span>
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
        <span className={`text-[11px] font-[510] uppercase tracking-wide px-2 py-0.5 rounded-full ${
          !course.closed
            ? "bg-primary/10 text-primary"
            : "bg-secondary text-muted-foreground"
        }`}>
          {!course.closed ? "Current" : "Completed"}
        </span>

        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(course)}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Edit grade"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(course.id.toString())}
              className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
              title="Remove course"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
