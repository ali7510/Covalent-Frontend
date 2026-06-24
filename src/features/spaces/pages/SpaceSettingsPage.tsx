import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { isAxiosError } from "axios"
import { ArrowLeft, Settings, Save, Shield, X, UserCheck } from "lucide-react"
import { useCurrentSpace } from "@/hooks/useCurrentSpace"
import { useUpdateSpace, usePromoteToAdmin, useSpaceMembers } from "@/hooks/useSpaces"
import { toast } from "sonner"
import type { UpdateSpaceBody } from "@/lib/types"
import LoadingState from "@/components/shared/LoadingState"
import EmptyState from "@/components/shared/EmptyState"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const CATEGORIES = ["COLLEGE_COURSE", "TUTORIAL", "PROGRAMMING_LANGUAGE", "FRAMEWORK"] as const
type Category = typeof CATEGORIES[number]

const updateSpaceSchema = z.object({
  name: z.string().min(1, "Space name cannot be empty."),
  category: z.enum(CATEGORIES),
  courseCode: z.string().optional(),
  description: z.string().optional(),
})

type UpdateSpaceFormValues = z.infer<typeof updateSpaceSchema>

export default function SpaceSettingsPage() {
  const { spaceId, space, isLoading, isAdmin } = useCurrentSpace()

  const [promotingMember, setPromotingMember] = useState<{ userId: string; fullName: string } | null>(null)

  const updateMutation = useUpdateSpace()
  const promoteMutation = usePromoteToAdmin()
  const { data: members, isLoading: membersLoading } = useSpaceMembers(spaceId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateSpaceFormValues>({
    resolver: zodResolver(updateSpaceSchema),
    defaultValues: {
      name: "",
      category: "COLLEGE_COURSE",
      courseCode: "",
      description: "",
    },
  })

  const watchCategory = watch("category")

  useEffect(() => {
    if (space) {
      reset({
        name: space.name,
        category: (space.category as Category) ?? "COLLEGE_COURSE",
        courseCode: space.courseCode ?? "",
        description: space.description ?? "",
      })
    }
  }, [space, reset])

  if (isLoading) return <LoadingState message="Loading space settings…" />

  if (!space) {
    return (
      <EmptyState
        title="Space not found"
        description="The space you're looking for doesn't exist or has been removed."
      />
    )
  }

  if (!isAdmin) {
    return (
      <EmptyState
        title="Access Denied"
        description="You must be an admin of this space to view its settings."
      />
    )
  }

  const onSubmit = (values: UpdateSpaceFormValues) => {
    const body: UpdateSpaceBody = {
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      category: values.category || undefined,
      courseCode:
        values.category === "COLLEGE_COURSE" && values.courseCode?.trim()
          ? values.courseCode.trim()
          : undefined,
    }

    updateMutation.mutate(
      { spaceId: space.id, body },
      {
        onSuccess: () => toast.success("Space settings saved!"),
        onError: (err) =>
          toast.error(
            isAxiosError(err)
              ? err.response?.data?.message || "Failed to save settings"
              : "Failed to save settings"
          ),
      }
    )
  }

  const handlePromote = () => {
    if (!promotingMember || !spaceId) return
    promoteMutation.mutate(
      { spaceId, memberId: promotingMember.userId },
      {
        onSuccess: () => {
          toast.success(`${promotingMember.fullName} promoted to admin!`)
          setPromotingMember(null)
        },
        onError: (err) =>
          toast.error(
            isAxiosError(err)
              ? err.response?.data?.message || "Failed to promote member"
              : "Failed to promote member"
          ),
      }
    )
  }

  const categoryLabel = (cat: string) => {
    if (cat === "COLLEGE_COURSE") return "Course"
    return cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in duration-300">
      {/* Back link */}
      <Link
        to={`/spaces/${spaceId}`}
        className="inline-flex items-center space-x-1.5 text-[12px] font-[510] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to {space.name}</span>
      </Link>

      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground text-background">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground">
            Space Settings
          </h1>
          <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">
            Manage your space details and members.
          </p>
        </div>
      </div>

      {/* Edit Details Card */}
      <div className="rounded-md border border-border bg-card shadow-card-light dark:shadow-card-dark p-6 space-y-6">
        <h2 className="text-[15px] leading-[24px] font-[510] text-foreground border-b border-border pb-3">
          Space Details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-[510] text-foreground">
              Space Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
            {errors.name && (
              <p className="text-[12px] text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[13px] font-[510] text-foreground">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setValue("category", cat)
                    if (cat !== "COLLEGE_COURSE") setValue("courseCode", "")
                  }}
                  className={`py-2.5 px-3 text-[12px] font-[510] rounded-full border transition-all duration-200 ${
                    watchCategory === cat
                      ? "bg-foreground border-foreground text-background"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {categoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Course Code — conditionally shown */}
          {watchCategory === "COLLEGE_COURSE" && (
            <div className="space-y-1.5">
              <label className="text-[13px] font-[510] text-foreground">Course Code</label>
              <input
                type="text"
                {...register("courseCode")}
                placeholder="e.g. CS-420"
                className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
              {errors.courseCode && (
                <p className="text-[12px] text-destructive">{errors.courseCode.message}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-[510] text-foreground">Description</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe the space purpose and goals..."
              className="w-full rounded-md border border-border px-3 py-2.5 text-[13px] bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all resize-none"
            />
            {errors.description && (
              <p className="text-[12px] text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-[13px] font-[510] rounded-full bg-foreground text-background hover:opacity-90 disabled:opacity-50 active:scale-98 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{updateMutation.isPending ? "Saving…" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Promote to Admin Card */}
      <div className="rounded-md border border-border bg-card shadow-card-light dark:shadow-card-dark p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-border pb-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[15px] leading-[24px] font-[510] text-foreground">Promote to Admin</h2>
        </div>
        <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">
          Select a regular member to grant them co-admin privileges for this space.
        </p>

        {membersLoading ? (
          <LoadingState message="Loading members…" />
        ) : !members || members.filter(m => m.role === "MEMBER").length === 0 ? (
          <EmptyState title="No eligible members" description="There are currently no other members to promote." />
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {members
              .filter(m => m.role === "MEMBER")
              .map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary border border-border text-[12px] font-[510] text-foreground">
                    {member.userName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-[13px] font-[510] text-foreground">{member.userName}</p>
                    <p className="text-[11px] text-muted-foreground font-normal">
                      Member since {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPromotingMember({ userId: member.userId, fullName: member.userName })}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-[12px] font-[510] bg-foreground text-background hover:opacity-90 active:scale-98 transition-all"
                >
                  <Shield className="h-3 w-3" />
                  <span>Promote</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Promote Confirmation Modal */}
      {promotingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md rounded-md border border-border bg-card shadow-lg p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-[15px] leading-[24px] font-[510] text-foreground">Confirm Promotion</h3>
              </div>
              <button
                onClick={() => setPromotingMember(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[13px] leading-[18px] text-muted-foreground font-normal leading-relaxed">
              Are you sure you want to promote{" "}
              <span className="font-[510] text-foreground">{promotingMember.fullName}</span>{" "}
              to admin? This will grant them full administrative access to this space.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setPromotingMember(null)}
                className="px-4 py-2 text-[13px] font-[510] rounded-full border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePromote}
                disabled={promoteMutation.isPending}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-[13px] font-[510] rounded-full bg-foreground text-background hover:opacity-90 disabled:opacity-50 active:scale-98 transition-all"
              >
                <Shield className="h-3.5 w-3.5" />
                <span>{promoteMutation.isPending ? "Promoting…" : "Confirm Promotion"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
