import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { isAxiosError } from "axios"
import { toast } from "sonner"
import { 
  Sparkles, 
  Brain, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertTriangle, 
  Activity, 
  BookOpen, 
  RefreshCw, 
  Award,
  BookMarked
} from "lucide-react"

import { useQuestionnaire, useScoreQuestionnaire, usePredictDepartment } from "@/hooks/usePrediction"
import LoadingState from "@/components/shared/LoadingState"
import type { DepartmentScore } from "@/lib/types"

// Department info mapping for result summaries
const DEPARTMENT_DETAILS: Record<string, { desc: string; careers: string[]; color: string }> = {
  "Artificial Intelligence": {
    desc: "Focuses on building intelligent agents, machine learning algorithms, deep learning models, natural language processing, and advanced cognitive robotics.",
    careers: ["Machine Learning Engineer", "AI Researcher", "Computer Vision Specialist", "NLP Engineer"],
    color: "from-blue-500 to-indigo-600",
  },
  "Computer Science": {
    desc: "Emphasizes the theoretical foundations of computation, algorithms design, advanced software engineering practices, system programming, and security principles.",
    careers: ["Software Engineer", "Systems Architect", "Fullstack Developer", "Algorithm Engineer"],
    color: "from-emerald-500 to-teal-600",
  },
  "Information Technology": {
    desc: "Centers around computer networks, security infrastructure, systems administration, database management, and cloud architecture implementation.",
    careers: ["Network Administrator", "Cloud Engineer", "IT Infrastructure Specialist", "Database Administrator"],
    color: "from-violet-500 to-purple-600",
  },
  "Information Systems": {
    desc: "Combines technical solutions with business applications, business process management, data analytics for management, and enterprise software architecture.",
    careers: ["Business Analyst", "IT Project Manager", "ERP Consultant", "Systems Analyst"],
    color: "from-amber-500 to-orange-600",
  },
  "Operation Research & Decision Support": {
    desc: "Focuses on optimization models, linear programming, mathematical analytics, decision support systems, data science, and big data forecasting.",
    careers: ["Operations Research Analyst", "Data Scientist", "Decision Support Specialist", "Data Analyst"],
    color: "from-pink-500 to-rose-600",
  },
}

// In case the backend returns shortened keys, let's normalize them for details lookup
const canonMap = (name: string) => {
  if (name === "AI" || name.toLowerCase().includes("artificial")) return "Artificial Intelligence";
  if (name === "CS" || name.toLowerCase().includes("computer science")) return "Computer Science";
  if (name === "IT" || name.toLowerCase().includes("information technology")) return "Information Technology";
  if (name === "IS" || name.toLowerCase().includes("information systems")) return "Information Systems";
  if (name === "DS" || name.toLowerCase().includes("operation research") || name.toLowerCase().includes("decision support") || name.toLowerCase().includes("ds")) return "Operation Research & Decision Support";
  return name;
}

export default function DepartmentPredictorPage() {
  const navigate = useNavigate()

  // State Machine
  // "onboarding" | "quiz" | "evaluating" | "results" | "error_422"
  const [step, setStep] = useState<"onboarding" | "quiz" | "evaluating" | "results" | "error_422">("onboarding")

  // Quiz progression
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  // Stored Questionnaire Scoring Response (for fallback view)
  const [questionnaireScore, setQuestionnaireScore] = useState<Record<string, number> | null>(null)

  // Stored Prediction Response (success state)
  const [predictionResult, setPredictionResult] = useState<any>(null)

  // Stored 422 Error Data (insufficient course details)
  const [validationError, setValidationError] = useState<{
    missingCourses: string[]
    incompleteCourses: string[]
  } | null>(null)

  // Toggle fallback state inside 422 error
  const [viewQuestionnaireFallback, setViewQuestionnaireFallback] = useState(false)

  // Hooks
  const { data: quizData, isLoading: quizLoading } = useQuestionnaire()
  const scoreMutation = useScoreQuestionnaire()
  const predictMutation = usePredictDepartment()

  const handleStartQuiz = () => {
    setStep("quiz")
    setCurrentQuestionIndex(0)
    setAnswers({})
  }

  const handleSelectAnswer = (qId: number, aId: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: aId
    }))
  }

  const handleNext = () => {
    if (!quizData) return
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!quizData) return
    setStep("evaluating")

    try {
      // Step 1: Score the questionnaire answers on the backend
      const requestPayload = {
        answers: Object.entries(answers).reduce((acc, [qId, aId]) => {
          acc[Number(qId)] = String(aId)
          return acc
        }, {} as Record<number, string>)
      }
      
      const scoreRes = await scoreMutation.mutateAsync(requestPayload)
      setQuestionnaireScore(scoreRes.normalized)

      // Step 2: Request the ML + Questionnaire combined department prediction
      const predictRes = await predictMutation.mutateAsync(scoreRes.normalized)
      setPredictionResult(predictRes)
      setStep("results")
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        // ML pipeline rejected because student has incomplete course data
        const errorData = error.response.data.data
        setValidationError({
          missingCourses: errorData?.missingCourses ?? [],
          incompleteCourses: errorData?.incompleteCourses ?? []
        })
        setStep("error_422")
      } else {
        toast.error("An unexpected error occurred during prediction evaluation.")
        setStep("onboarding")
      }
    }
  }

  const handleReset = () => {
    setStep("onboarding")
    setAnswers({})
    setCurrentQuestionIndex(0)
    setPredictionResult(null)
    setQuestionnaireScore(null)
    setValidationError(null)
    setViewQuestionnaireFallback(false)
  }

  // ---------------------------------------------------------------------------
  // RENDER STATES
  // ---------------------------------------------------------------------------

  if (quizLoading) {
    return <LoadingState message="Fetching advisor questionnaire..." />
  }

  // 1. ONBOARDING STATE
  if (step === "onboarding") {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in duration-300">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
            Academic <span className="font-[510]">Department Advisor</span>
          </h1>
          <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
            Find the perfect academic major tailored to your interests, cognitive skills, and university course performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Main info card */}
          <div className="md:col-span-8 rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <h3 className="text-[18px] font-[510] text-foreground tracking-tight">How it works</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                The advisor combines a 20-question cognitive survey with your official academic history. 
                Our ML classification model maps your performance scores against historical graduates to predict your optimal department fit.
              </p>
              <div className="space-y-3 pt-2 text-[12px] text-muted-foreground">
                <div className="flex items-center space-x-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>20 Cognitive & Scenario-choice questions (~10 mins)</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time ML analysis of completed pre-requisites</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Sorted multi-score comparison report</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="w-full sm:w-auto self-start inline-flex items-center justify-center space-x-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-[13px] font-[510] hover:opacity-90 active:scale-98 transition-all shadow-btn-primary cursor-pointer"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Department Quick List */}
          <div className="md:col-span-4 rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
            <h4 className="text-[12px] font-[510] uppercase tracking-wider text-foreground">Target Disciplines</h4>
            <div className="space-y-3.5 pt-1">
              {[
                { name: "CS", full: "Computer Science", color: "bg-emerald-500" },
                { name: "AI", full: "Artificial Intelligence", color: "bg-blue-500" },
                { name: "IT", full: "Information Technology", color: "bg-violet-500" },
                { name: "IS", full: "Information Systems", color: "bg-amber-500" },
                { name: "DS", full: "Decision Support & OR", color: "bg-rose-500" },
              ].map(dept => (
                <div key={dept.name} className="flex items-center space-x-3 text-[12px]">
                  <div className={`h-2 w-2 rounded-full ${dept.color}`} />
                  <div className="flex-1 min-w-0">
                    <span className="font-[510] text-foreground block leading-none">{dept.name}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">{dept.full}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. QUIZ WIZARD STATE
  if (step === "quiz" && quizData) {
    const totalQ = quizData.questions.length
    const q = quizData.questions[currentQuestionIndex]
    const progress = Math.round(((currentQuestionIndex + 1) / totalQ) * 100)
    const isAnswered = answers[q.id] !== undefined
    const selectedAnswer = answers[q.id]

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in duration-300">
        {/* Progress header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px] font-[510]">
            <span className="text-muted-foreground uppercase tracking-wider">Assessment In Progress</span>
            <span className="text-foreground">Question {currentQuestionIndex + 1} of {totalQ}</span>
          </div>
          <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-6">
          <div className="space-y-2">
            {q.explanation && (
              <span className="inline-block text-[9px] font-[510] tracking-wider uppercase bg-secondary text-muted-foreground px-2 py-0.5 rounded border border-border">
                {q.type.replace("_", " ")}
              </span>
            )}
            <h2 className="text-[16px] font-[510] leading-snug text-foreground">
              {q.text}
            </h2>
          </div>

          {/* Answer Choice Cards */}
          <div className="space-y-2.5">
            {q.answers.map(ans => {
              const isSelected = selectedAnswer === ans.id
              return (
                <button
                  key={ans.id}
                  onClick={() => handleSelectAnswer(q.id, ans.id)}
                  className={`w-full text-left p-4 rounded-md border text-[13px] transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary font-[510] shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{ans.text}</span>
                  <div className={`h-4.5 w-4.5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-primary bg-primary" : "border-border bg-background"
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-border text-[12px] font-[510] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentQuestionIndex < totalQ - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isAnswered}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-[510] hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              disabled={!isAnswered || scoreMutation.isPending || predictMutation.isPending}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[12px] font-[510] hover:opacity-90 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-btn-primary animate-pulse hover:animate-none cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Prediction</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // 3. EVALUATING LOADING STATE
  if (step === "evaluating") {
    return (
      <div className="max-w-md mx-auto rounded-md border border-border bg-card p-8 text-center space-y-6 shadow-card-light dark:shadow-card-dark animate-fade-in duration-300">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-spin">
            <RefreshCw className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-[16px] font-[510] text-foreground">Processing Academic Profile</h3>
          <p className="text-[12px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Calling prediction client, running feature compilation, and mapping grades to compute department recommendation...
          </p>
        </div>
      </div>
    )
  }

  // 4. RESULTS DASHBOARD
  if (step === "results" && predictionResult) {
    const scoresList: DepartmentScore[] = predictionResult.departmentScores
    const topDeptAbbr = predictionResult.topDepartment
    const topDeptName = canonMap(topDeptAbbr)
    const topDeptDetails = DEPARTMENT_DETAILS[topDeptName] || {
      desc: "Perfect match according to performance metrics and interests survey.",
      careers: ["System Engineer"],
      color: "from-primary to-indigo-600"
    }

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-[510] uppercase tracking-wider text-primary">Assessment Complete</span>
            <h1 className="text-[28px] font-normal leading-none tracking-tight text-foreground">
              Advisor <span className="font-[510]">Recommendation</span>
            </h1>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center space-x-1.5 border border-border px-3.5 py-1.5 rounded-full text-[12px] font-[510] text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retake Advisor</span>
          </button>
        </div>

        {/* Warning Alert if model was down */}
        {predictionResult.warning && (
          <div className="rounded-md border border-amber-200 dark:border-amber-900/30 bg-amber-500/5 p-4 flex gap-3 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <span className="font-[510] block">ML Service Notice</span>
              {predictionResult.warning}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Top Recommendation Banner / Left */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`rounded-md p-6 bg-gradient-to-br ${topDeptDetails.color} text-white shadow-lg space-y-6`}>
              <div className="space-y-4">
                <span className="inline-block text-[9px] font-[510] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                  Top Recommended Major
                </span>
                <h2 className="text-[24px] font-[510] tracking-tight leading-tight">
                  {topDeptName}
                </h2>
                <p className="text-[12px] text-white/80 leading-relaxed font-normal">
                  {topDeptDetails.desc}
                </p>
              </div>

              {/* Career Paths list */}
              <div className="space-y-2 border-t border-white/20 pt-4">
                <span className="text-[10px] font-[510] uppercase tracking-wider text-white/70 block">Target Careers</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-[510]">
                  {topDeptDetails.careers.map((career, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />
                      <span className="truncate">{career}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Information metadata */}
            <div className="rounded-md border border-border bg-card p-5 shadow-card-light dark:shadow-card-dark text-[11px] text-muted-foreground space-y-3">
              <span className="text-[10px] font-[510] uppercase tracking-wider text-foreground block">Evaluation Metadata</span>
              <div className="flex justify-between">
                <span>Evaluation Mode</span>
                <span className="font-[510] text-foreground">
                  {predictionResult.modelAvailable ? "Hybrid Questionnaire + ML Classifier" : "Questionnaire Only"}
                </span>
              </div>
              {predictionResult.modelAvailable && (
                <div className="flex justify-between">
                  <span>ML Model Version</span>
                  <span className="font-[510] text-foreground">{predictionResult.modelVersion}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Weighted Ratios</span>
                <span className="font-[510] text-foreground">
                  Q: {Math.round(predictionResult.weights.questionnaire * 100)}% / M: {Math.round(predictionResult.weights.model * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Scores comparison chart / Right */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-6">
              <div className="space-y-1">
                <h3 className="text-[14px] font-[510] text-foreground flex items-center space-x-2">
                  <Activity className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>Evaluation Score Comparison</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Ranks suitability scores from the cognitive questionnaire and ML grade classification.
                </p>
              </div>

              {/* Custom SVG/Tailwind comparative chart */}
              <div className="space-y-6 pt-2">
                {scoresList.map((entry) => {
                  const deptCanon = canonMap(entry.department)
                  // Combined score percentage
                  const combinedPercent = Math.round(entry.combinedScore * 100)
                  const questionnairePercent = Math.round(entry.questionnaireScore * 100)
                  const modelPercent = entry.modelScore !== null ? Math.round(entry.modelScore * 100) : null

                  return (
                    <div key={entry.department} className="space-y-2">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="font-[510] text-foreground">{deptCanon}</span>
                        <span className="font-[510] text-primary">{combinedPercent}% Match</span>
                      </div>

                      {/* Stacked visualization bar */}
                      <div className="space-y-1.5">
                        {/* Combined match score row */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-muted-foreground font-medium">
                            <span>Combined Score</span>
                            <span>{combinedPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${combinedPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Sub-scores (Q & ML breakdown) */}
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          <div className="space-y-0.5">
                            <div className="flex justify-between text-[8px] text-muted-foreground">
                              <span>Survey Score</span>
                              <span>{questionnairePercent}%</span>
                            </div>
                            <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full opacity-70"
                                style={{ width: `${questionnairePercent}%` }}
                              />
                            </div>
                          </div>

                          {modelPercent !== null && (
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[8px] text-muted-foreground">
                                <span>ML Grade Score</span>
                                <span>{modelPercent}%</span>
                              </div>
                              <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full opacity-70"
                                  style={{ width: `${modelPercent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Chart Legend */}
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border pt-4 mt-2 font-medium">
                <div className="flex items-center space-x-1.5">
                  <div className="h-2 w-4 bg-primary rounded" />
                  <span>Combined Score</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="h-2 w-4 bg-accent rounded opacity-75" />
                  <span>Advisor Survey</span>
                </div>
                {predictionResult.modelAvailable && (
                  <div className="flex items-center space-x-1.5">
                    <div className="h-2 w-4 bg-emerald-500 rounded opacity-75" />
                    <span>ML Grade Prediction</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 5. INSUFFICIENT DATA (HTTP 422) & DUAL VIEW FALLBACK
  if (step === "error_422" && validationError) {

    // Helper to render the fallback Questionnaire score view
    if (viewQuestionnaireFallback && questionnaireScore) {
      // Formats questionnaire score into mock prediction results structure
      const sortedQList = Object.entries(questionnaireScore)
        .map(([dept, score]) => ({
          department: dept,
          questionnaireScore: score,
          modelScore: null,
          combinedScore: score
        }))
        .sort((a, b) => b.combinedScore - a.combinedScore)

      const topDeptAbbr = sortedQList[0].department
      const topDeptName = canonMap(topDeptAbbr)
      const topDeptDetails = DEPARTMENT_DETAILS[topDeptName] || {
        desc: "Survey match based on cognitive and career alignment.",
        careers: [],
        color: "from-primary to-indigo-600"
      }

      return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in duration-300">
          <div className="rounded-md border border-amber-200 dark:border-amber-900/30 bg-amber-500/5 p-4 flex gap-3 text-[12px] leading-relaxed text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <span className="font-[510] block">Viewing Questionnaire Match (ML Prediction Halted)</span>
              The report below is derived **exclusively** from your questionnaire survey. The machine learning model is blocked because of missing database course records. 
              <button 
                onClick={() => setViewQuestionnaireFallback(false)}
                className="underline font-[510] ml-1 text-primary cursor-pointer"
              >
                Review missing requirements.
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-[510] uppercase tracking-wider text-primary">Survey Results Report</span>
              <h1 className="text-[28px] font-normal leading-none tracking-tight text-foreground">
                Survey <span className="font-[510]">Recommendation</span>
              </h1>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-1.5 border border-border px-3.5 py-1.5 rounded-full text-[12px] font-[510] text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retake Advisor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className={`rounded-md p-6 bg-gradient-to-br ${topDeptDetails.color} text-white shadow-lg space-y-6`}>
                <div className="space-y-4">
                  <span className="inline-block text-[9px] font-[510] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                    Survey Match
                  </span>
                  <h2 className="text-[24px] font-[510] tracking-tight leading-tight">
                    {topDeptName}
                  </h2>
                  <p className="text-[12px] text-white/80 leading-relaxed font-normal">
                    {topDeptDetails.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-6">
                <h3 className="text-[14px] font-[510] text-foreground">Survey Match Score Summary</h3>
                <div className="space-y-5">
                  {sortedQList.map((entry) => {
                    const deptCanon = canonMap(entry.department)
                    const percent = Math.round(entry.combinedScore * 100)

                    return (
                      <div key={entry.department} className="space-y-2">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-[510] text-foreground">{deptCanon}</span>
                          <span className="font-[510] text-primary">{percent}% Match</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in duration-300">
        <div className="space-y-2">
          <h1 className="text-[28px] font-normal leading-tight tracking-tight text-foreground">
            ML Prediction <span className="font-[510]">Requires Action</span>
          </h1>
          <p className="text-muted-foreground text-[14px]">
            Our graduation prediction engine evaluates performance thresholds on specific pre-requisite modules. Your academic profile is currently missing required data points.
          </p>
        </div>

        {/* Action Panel listing missing courses */}
        <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-border">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-[14px] font-[510] text-foreground">Missing Course Prerequisites</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Registrations card */}
            <div className="rounded-md border border-border bg-secondary/30 p-4 space-y-3">
              <span className="text-[10px] font-[510] uppercase tracking-wider text-destructive flex items-center space-x-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Not Registered ({validationError.missingCourses.length})</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The ML model expects registration history for these specific modules:
              </p>
              {validationError.missingCourses.length === 0 ? (
                <span className="text-[12px] font-medium text-foreground block pt-1">— None —</span>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {validationError.missingCourses.map(code => (
                    <span key={code} className="px-2.5 py-0.5 rounded border border-red-200 dark:border-red-900/50 bg-red-500/5 text-destructive text-[11px] font-[510] uppercase">
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Incomplete grades card */}
            <div className="rounded-md border border-border bg-secondary/30 p-4 space-y-3">
              <span className="text-[10px] font-[510] uppercase tracking-wider text-amber-600 flex items-center space-x-1.5">
                <BookMarked className="h-3.5 w-3.5" />
                <span>Grades Pending ({validationError.incompleteCourses.length})</span>
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Registered courses awaiting final Continuous Assessment or Final Exam grades:
              </p>
              {validationError.incompleteCourses.length === 0 ? (
                <span className="text-[12px] font-medium text-foreground block pt-1">— None —</span>
              ) : (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {validationError.incompleteCourses.map(code => (
                    <span key={code} className="px-2.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/50 bg-amber-500/5 text-amber-600 text-[11px] font-[510] uppercase">
                      {code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border mt-4">
            <button
              onClick={() => navigate("/online-courses")}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-[12px] font-[510] hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-btn-primary"
            >
              <Award className="h-4 w-4" />
              <span>Go to Academic Course Tracker</span>
            </button>

            {questionnaireScore && (
              <button
                onClick={() => setViewQuestionnaireFallback(true)}
                className="w-full sm:w-auto text-[12px] font-[510] text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                View Questionnaire Match Only
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}
