import { ArrowRight, BookOpen, FolderKanban, Rocket, Sparkles, Target, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { upsertNewsletterSubscription } from '../services/databaseService'

const profileStats = [
  {
    value: '5+',
    label: 'Ongoing Projects',
    icon: FolderKanban,
  },
  {
    value: '2+',
    label: 'Books Published',
    icon: BookOpen,
  },
  {
    value: '20+',
    label: 'Students',
    icon: Users,
  },
]

const studentFeedbacks = [
  {
    quote:
      'The AI course sessions are incredibly easy to understand and very practical for our real-world projects.',
    name: 'V srinivas',
    role: 'AI Course Student',
    avatar: 'https://placehold.co/96x96/EAF4FF/1A1A2E?text=VS',
  },
  {
    quote:
      'I loved how the AI curriculum bridges complex mathematical concepts and modern applications step by step.',
    name: 'M.V.D bhavani',
    role: 'AI Course Learner',
    avatar: 'https://placehold.co/96x96/E8FFF9/1A1A2E?text=MB',
  },
  {
    quote:
      'The mentors helped me gain total confidence in AI model building and neural network integration.',
    name: 'M yashwitha',
    role: 'AI Tech Student',
    avatar: 'https://placehold.co/96x96/F0EEFF/1A1A2E?text=MY',
  },
  {
    quote:
      'Learning AI here feels future-focused and industry-aligned. It truly improved my technical clarity in machine learning.',
    name: 'P Charan',
    role: 'AI Course Enthusiast',
    avatar: 'https://placehold.co/96x96/FFF5EC/1A1A2E?text=PC',
  },
]

function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterError, setNewsletterError] = useState('')

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault()
    setNewsletterMessage('')
    setNewsletterError('')
    setIsSubmittingNewsletter(true)

    try {
      await upsertNewsletterSubscription(newsletterEmail)
      setNewsletterMessage('Subscribed successfully. You will receive updates soon.')
      setNewsletterEmail('')
    } catch (error) {
      setNewsletterError(error?.message ?? 'Unable to subscribe right now. Please try again.')
    } finally {
      setIsSubmittingNewsletter(false)
    }
  }

  return (
    <div className="space-y-16 pb-8 sm:space-y-20">
      <section className="section-shell">
        <div className="hero-panel text-center">
          <div className="mx-auto max-w-3xl">
            <p className="section-kicker mb-4">
              <Sparkles size={15} /> Innovation Hub
            </p>
            <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
              Building the future of semiconductors and AI for smarter world
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-ink/70 dark:text-gray-300 sm:text-lg">
              We combine advanced electronics and intelligent systems education to create practical,
              affordable, and future-ready technology solutions.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/courses" className="btn-primary gap-2">
                Explore Programs <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn-secondary">View Projects</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="surface-card">
            <p className="section-kicker mb-4">
              <Target size={14} /> Vision
            </p>
            <p className="text-ink/75 dark:text-gray-300">
              To become a leading innovator in semiconductors and artificial intelligence
              technologies building intelligence efficient and affordable solutions that empower
              the future of electronics healthcare and sustainable living.
            </p>
          </article>

          <article className="surface-card">
            <p className="section-kicker mb-4">
              <Rocket size={14} /> Mission
            </p>
            <p className="text-ink/75 dark:text-gray-300">
              To design develop and manufacture intelligence semiconductor based products by
              integrating advanced electronics with artificial intelligence while Bridging the gap
              between traditional engineering learning and next generation technologies learning.
            </p>
          </article>
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-7 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold dark:text-gray-100">Company Profile</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {profileStats.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.label} className="surface-card text-center">
                <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400">
                  <Icon size={20} />
                </span>
                <p className="mt-3 text-3xl font-bold text-ink dark:text-gray-100">{item.value}</p>
                <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">{item.label}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-7">
          <h2 className="text-3xl font-semibold dark:text-gray-100">Student Feedback</h2>
          <p className="mt-2 text-ink/70 dark:text-gray-400">
            90% of our students are satisfied with the learning experience. Here is what our students say.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {studentFeedbacks.map((item) => (
            <article key={item.name} className="surface-card">
              <p className="text-ink/80 dark:text-gray-300">"{item.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={item.avatar} alt={item.name} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="font-semibold dark:text-gray-100">{item.name}</p>
                  <p className="text-sm text-ink/65 dark:text-gray-400">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="rounded-3xl bg-ink p-8 text-white dark:bg-gray-900 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/90">
                <Sparkles size={14} /> Build Smarter Systems
              </p>
              <h2 className="mt-4 text-3xl font-semibold dark:text-gray-100">Join Our Innovation Community</h2>
              <p className="mt-2 text-white/80 dark:text-gray-300">Get updates on semiconductor and AI learning initiatives.</p>
            </div>
            <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" onSubmit={handleNewsletterSubmit}>
              <label htmlFor="home-email" className="sr-only">Email</label>
              <input
                id="home-email"
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                className="h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-sky-200"
                required
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-primary px-6 font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmittingNewsletter}
              >
                {isSubmittingNewsletter ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {(newsletterMessage || newsletterError) && (
              <p className="w-full text-sm text-white/85 lg:max-w-xl">
                {newsletterError || newsletterMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
