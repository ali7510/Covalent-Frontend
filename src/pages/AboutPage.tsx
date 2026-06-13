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
        <h1 className="text-[28px] leading-[1.2] tracking-[-0.5px] font-normal text-foreground">
          About <span className="font-[510]">Covalent</span>
        </h1>
        <p className="text-muted-foreground font-normal max-w-2xl text-[14px] leading-relaxed">
          Learn about our mission, explore frequently asked questions, and discover how Covalent centralizes your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Core Description Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
            <h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground flex items-center space-x-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <span>Project Vision</span>
            </h3>
            <p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal text-muted-foreground">
              Covalent was founded on the idea that academic collaboration shouldn't be scattered across multiple disconnected tools. By combining structured course discussion spaces, peer-to-peer knowledge sharing, study scheduling tools, and verified learning materials under a clean, minimal interface, Covalent bridges the gap between learning and productivity.
            </p>
            <p className="text-[15px] leading-[24px] tracking-[-0.165px] font-normal text-muted-foreground">
              Whether you are looking to find resources for tomorrow's midterm, get answers to a programming assignment, or track your overall academic GPA analytics, Covalent coordinates your studies dynamically.
            </p>
            <div className="pt-4 flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 rounded-full border border-border px-4 py-2 text-[13px] font-[510] text-foreground hover:bg-muted active:scale-98 transition-all"
              >
                <Code2 className="h-4 w-4" />
                <span>Source Code</span>
              </a>
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-5">
            <h3 className="text-[20px] leading-[26.6px] tracking-[-0.24px] font-[510] text-foreground flex items-center space-x-2 pb-2 border-b border-border">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span>Frequently Asked Questions</span>
            </h3>
            <div className="space-y-4 divide-y divide-border">
              {faqItems.map((item, idx) => (
                <div key={idx} className={`pt-4 ${idx === 0 ? "pt-0" : ""}`}>
                  <h4 className="text-[15px] leading-[24px] font-[510] text-foreground mb-1">{item.q}</h4>
                  <p className="text-[13px] leading-[18px] text-muted-foreground font-normal">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards / Right Side */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-md border border-border bg-card p-6 shadow-card-light dark:shadow-card-dark space-y-4">
            <h3 className="text-[16px] leading-[24px] font-[510] text-foreground">Platform Capabilities</h3>
            <div className="space-y-3.5">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-secondary border border-border">
                  <GraduationCap className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-[13px] leading-[18px] font-[510] text-foreground">Intelligent Metrics</h4>
                  <p className="text-[12px] leading-[16px] text-muted-foreground font-normal">Integrated GPA tracking, level metrics, XP rewards, and streak multipliers to motivate studies.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 p-1 rounded-md bg-secondary border border-border">
                  <BookOpen className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-[13px] leading-[18px] font-[510] text-foreground">Course Registrations</h4>
                  <p className="text-[12px] leading-[16px] text-muted-foreground font-normal">Add courses, record letter grades or numerical scores, and automatically compute semester analytics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
