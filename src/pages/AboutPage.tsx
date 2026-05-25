import { Info, HelpCircle, BookOpen, GraduationCap, Code2 } from "lucide-react"

export default function AboutPage() {
  const faqItems = [
    { q: "What is Covalent?", a: "Covalent is a unified academic ecosystem designed to merge collaborative discussion forums, resource-sharing spaces, schedule trackers, and performance metrics in one single fast interface." },
    { q: "Who is this portal for?", a: "It is built specifically for students, professors, and academic course coordinators looking to streamline course queries and information sharing." },
    { q: "How do Study Spaces work?", a: "Each Space corresponds to an academic field, curriculum module, or specific course code. Inside spaces, users can create posts, ask academic questions, get answers upvoted by peers, and access shared course materials." },
    { q: "How does the Leaderboard work?", a: "Students earn experience points (XP) and levels for active engagement, such as creating helpful discussion posts, sharing lecture notes/resources, and having their answers marked as accepted by peers." }
  ]

  return (
    <div className="space-y-8 animate-fade-in duration-300">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-neutral-900 dark:text-white">
          About <span className="font-semibold">Covalent</span>
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 font-light max-w-2xl text-sm leading-relaxed">
          Learn about our mission, explore frequently asked questions, and discover how Covalent centralizes your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Core Description Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center space-x-2">
              <Info className="h-5 w-5 text-neutral-450 dark:text-neutral-500" />
              <span>Project Vision</span>
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
              Covalent was founded on the idea that academic collaboration shouldn't be scattered across multiple disconnected tools. By combining structured course discussion spaces, peer-to-peer knowledge sharing, study scheduling tools, and verified learning materials under a clean, minimal interface, Covalent bridges the gap between learning and productivity.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light leading-relaxed">
              Whether you are looking to find resources for tomorrow's midterm, get answers to a programming assignment, or track your overall academic GPA analytics, Covalent coordinates your studies dynamically.
            </p>
            <div className="pt-4 flex items-center space-x-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center space-x-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 active:scale-98 transition-all"
              >
                <Code2 className="h-4 w-4" />
                <span>Source Code</span>
              </a>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center space-x-2 pb-2 border-b border-neutral-150 dark:border-neutral-900">
              <HelpCircle className="h-5 w-5 text-neutral-450 dark:text-neutral-500" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-4 divide-y divide-neutral-100 dark:divide-neutral-900">
              {faqItems.map((item, idx) => (
                <div key={idx} className={`pt-4 ${idx === 0 ? "pt-0" : ""}`}>
                  <h4 className="text-sm font-semibold text-neutral-850 dark:text-neutral-200 mb-1">{item.q}</h4>
                  <p className="text-xs text-neutral-550 dark:text-neutral-400 font-light leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards / Right Side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Platform Capabilities</h3>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <GraduationCap className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-850 dark:text-neutral-300">Intelligent Metrics</h4>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-light leading-relaxed">Integrated GPA tracking, level metrics, XP rewards, and streak multipliers to motivate studies.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
                  <BookOpen className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-neutral-850 dark:text-neutral-300">Course Registrations</h4>
                  <p className="text-[11px] text-neutral-450 dark:text-neutral-500 font-light leading-relaxed">Add courses, record letter grades or numerical scores, and automatically compute semester analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
