import {
  Bot,
  CircleHelp,
  Cpu,
  Radio,
  Smartphone,
  GraduationCap,
} from 'lucide-react'
import { useState } from 'react'

const services = [
  {
    title: 'VLSI Chip Design',
    description: 'End-to-end VLSI design support from architecture planning to verification.',
    icon: Cpu,
  },
  {
    title: 'Embedded System Development',
    description: 'Custom embedded hardware and firmware development for intelligent products.',
    icon: Smartphone,
  },
  {
    title: 'IoT Services',
    description: 'Connected device solutions with sensor integration, monitoring, and automation.',
    icon: Radio,
  },
  {
    title: 'Software Solutions with AI',
    description: 'AI-powered software systems for analytics, automation, and decision support.',
    icon: Bot,
  },
]

const faqs = [
  {
    q: 'How do live classes work across time zones?',
    a: 'We run multiple cohorts and share recordings within 24 hours so you never miss key lessons.',
  },
  {
    q: 'Will I receive a certificate after completion?',
    a: 'Yes, certificate-enabled programs include shareable credentials and assessment benchmarks.',
  },
  {
    q: 'Can I switch between learning tracks later?',
    a: 'Absolutely. You can switch tracks and carry eligible progress to adjacent programs.',
  },
  {
    q: 'Are mentorship sessions included in every plan?',
    a: 'Mentorship is included in Pro plans, while starter plans can book sessions separately.',
  },
  {
    q: 'Do you offer support for career transitions?',
    a: 'Yes. We provide roadmap coaching, interview prep, and hiring partner opportunities.',
  },
]

function Services() {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="space-y-16 pb-8 sm:space-y-20">
      <section className="section-shell">
        <div className="hero-panel text-center">
          <p className="section-kicker mb-3 text-xs">
            <GraduationCap size={15} /> Learning Services
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl dark:text-gray-100">Everything you need to grow, in one learning ecosystem.</h1>
          <p className="mx-auto mt-4 max-w-3xl text-ink/70 dark:text-gray-300">
            From live collaboration to career launch support, our services are built to make your
            learning journey practical, structured, and motivating.
          </p>
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <article key={service.title} className="surface-card">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-sky-950/40 dark:text-sky-400">
                  <Icon size={20} />
                </span>
                <h2 className="mt-4 text-2xl font-semibold dark:text-gray-100">{service.title}</h2>
                <p className="mt-2 text-ink/70 dark:text-gray-300">{service.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section-shell">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
          <h2 className="mb-6 text-center text-3xl font-semibold dark:text-gray-100">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((item, index) => (
              <article key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50/70 dark:border-gray-700 dark:bg-gray-800/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq((prev) => (prev === index ? -1 : index))}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left dark:text-gray-100"
                >
                  <span className="font-semibold">{item.q}</span>
                  <CircleHelp size={18} className="text-primary dark:text-sky-400" />
                </button>
                {openFaq === index && <p className="px-5 pb-5 text-ink/70 dark:text-gray-300">{item.a}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
