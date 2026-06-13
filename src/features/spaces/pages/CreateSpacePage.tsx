import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { isAxiosError } from "axios"
import { Plus, ArrowLeft, Layers } from "lucide-react"
import { useCreateSpace, useJoinSpace, useUserSpaces } from "@/hooks/useSpaces"
import { toast } from "sonner"
import type { SpaceResponse } from "@/lib/types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const CATEGORIES = ["COLLEGE_COURSE", "TUTORIAL", "PROGRAMMING_LANGUAGE", "FRAMEWORK"] as const
type Category = typeof CATEGORIES[number]

const createSpaceSchema = z.object({
  name: z.string().min(1, "Space name is required."),
  category: z.enum(CATEGORIES),
  courseCode: z.string().optional(),
  description: z.string().optional(),
})

type CreateSpaceFormValues = z.infer<typeof createSpaceSchema>

export default function CreateSpacePage() {
  const navigate = useNavigate()

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [conflictSpaces, setConflictSpaces] = useState<SpaceResponse[] | null>(null)

  const createMutation = useCreateSpace()
  const joinMutation = useJoinSpace()
  const { data: mySpaces } = useUserSpaces()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      category: "COLLEGE_COURSE",
      courseCode: "",
      description: "",
    },
  })

  const watchCategory = watch("category")

  const handleReset = () => {
    reset()
    setErrorMsg(null)
    setConflictSpaces(null)
  }

  const onSubmit = (values: CreateSpaceFormValues, force = false) => {
    setErrorMsg(null)

    createMutation.mutate(
      {
        body: {
          name: values.name.trim(),
          category: values.category,
          courseCode: values.category === "COLLEGE_COURSE" && values.courseCode?.trim() ? values.courseCode.trim() : undefined,
          description: values.description?.trim() || undefined,
        },
        force,
      },
      {
        onSuccess: (newSpace) => {
          toast.success(`Space "${newSpace.name}" requested successfully!`)
          navigate(`/spaces/${newSpace.id}`)
        },
        onError: (err) => {
          if (isAxiosError(err) && err.response?.status === 409) {
            setConflictSpaces(err.response.data.data as SpaceResponse[])
          } else {
            setErrorMsg(
              isAxiosError(err)
                ? err.response?.data?.message || "Failed to create space. Please try again."
                : "Failed to create space. Please try again."
            )
          }
        },
      }
    )
  }

  const handleJoinConflict = (space: SpaceResponse) => {
    joinMutation.mutate(space.id, {
      onSuccess: () => {
        toast.success(`Joined "${space.name}"!`)
        navigate(`/spaces/${space.id}`)
      },
      onError: (err) => {
        toast.error(
          isAxiosError(err) ? err.response?.data?.message || "Failed to join space" : "Failed to join space"
        )
      },
    })
  }

  const categoryLabel = (cat: Category) => {
    if (cat === "COLLEGE_COURSE") return "Course"
    return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in duration-300">
      {/* Back link */}
      <Link
        to="/discover"
        className="inline-flex items-center space-x-1.5 text-[12px] font-[510] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Discover</span>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[24px] leading-[1.2] tracking-[-0.3px] font-[510] text-foreground">
              Request a Study Space
            </h1>
            <p className="text-[13px] text-muted-foreground font-normal">
              Request a new collaborative space for your course, tutorial, or tech stack.
            </p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-md border border-border bg-card shadow-card-light dark:shadow-card-dark p-6 space-y-6">

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 text-[12px] bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-md border border-red-200 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        {/* Conflict Review */}
        {conflictSpaces ? (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-[14px] font-[510] text-foreground">Similar Spaces Found</h2>
              <p className="text-[12px] text-muted-foreground leading-relaxed font-normal">
                Spaces with similar course codes or identifiers already exist. Consider joining one to pool discussions — or force-create your own.
              </p>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {conflictSpaces.map((space) => {
                const isJoined = mySpaces?.some((s) => s.id === space.id) ?? false
                return (
                  <div
                    key={space.id}
                    className="flex items-center justify-between p-4 rounded-md border border-border bg-secondary/30"
                  >
                    <div className="space-y-0.5">
                      <p className="text-[13px] font-[510] text-foreground">{space.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {space.category} · {space.memberCount} members
                        {space.similarityScore !== undefined && ` · ${Math.round(space.similarityScore * 100)}% match`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoinConflict(space)}
                      disabled={isJoined || joinMutation.isPending}
                      className={`rounded-full px-3.5 py-1.5 text-[12px] font-[510] border transition-all ${
                        isJoined
                          ? "bg-secondary text-muted-foreground border-border cursor-default"
                          : "bg-primary text-primary-foreground border-primary hover:opacity-90 active:scale-98"
                      }`}
                    >
                      {isJoined ? "Member" : "Join"}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                onClick={() => setConflictSpaces(null)}
                className="px-4 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary text-foreground transition-all"
              >
                ← Go Back
              </button>
              <button
                onClick={handleSubmit((values) => onSubmit(values, true))}
                disabled={createMutation.isPending}
                className="px-4 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {createMutation.isPending ? "Creating…" : "Force Create Anyway"}
              </button>
            </div>
          </div>
        ) : (
          /* Main creation form */
          <form onSubmit={handleSubmit((values) => onSubmit(values, false))} className="space-y-5">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-[11px] font-[510] uppercase tracking-wider text-muted-foreground">
                Space Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setValue("category", cat)
                      if (cat !== "COLLEGE_COURSE") {
                        setValue("courseCode", "")
                      }
                    }}
                    className={`py-2.5 px-3 text-[12px] font-[510] rounded-md border transition-all duration-200 ${
                      watchCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {categoryLabel(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Space Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-[510] uppercase tracking-wider text-muted-foreground">
                Space Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Distributed Operating Systems"
                className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Course Code (COLLEGE_COURSE only) */}
            {watchCategory === "COLLEGE_COURSE" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-[510] uppercase tracking-wider text-muted-foreground">
                  Course Code
                </label>
                <input
                  type="text"
                  {...register("courseCode")}
                  placeholder="e.g. CS-420"
                  className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                />
                {errors.courseCode && (
                  <p className="text-[10px] text-red-500 font-medium">{errors.courseCode.message}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-[510] uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <textarea
                {...register("description")}
                placeholder="Provide a short description of the learning goal or topic covered..."
                rows={3}
                className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
              />
              {errors.description && (
                <p className="text-[10px] text-red-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-[12px] font-[510] rounded-full border border-border hover:bg-secondary text-foreground transition-all"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center space-x-1.5 px-5 py-2 text-[12px] font-[510] rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 active:scale-98 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{createMutation.isPending ? "Submitting…" : "Request Space"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
