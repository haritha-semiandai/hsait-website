import { Award, Bell, BookOpenCheck, Clock3, Loader2, Mail, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserProfileData, subscribeToNotifications } from '../services/databaseService'
import { generatePptxCertificate } from '../services/certificateService'
import { useAuth } from '../context/AuthContext'

function formatDate(dateValue) {
  if (!dateValue || Number.isNaN(dateValue.getTime())) {
    return 'N/A'
  }

  return dateValue.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function Profile() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [profileData, setProfileData] = useState({
    user: null,
    summary: {
      completedCourses: 0,
      certificatesAchieved: 0,
      hoursLearned: 0,
      updatedAt: null,
    },
    completedCourses: [],
    enrolledCourses: [],
    certificates: [],
  })

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      setError('')

      try {
        const result = await getUserProfileData(user.uid)

        if (isMounted) {
          setProfileData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message ?? 'Unable to load profile details right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [user?.uid])

  const profileName = useMemo(() => {
    return profileData.user?.displayName || user?.displayName || 'Learner'
  }, [profileData.user?.displayName, user?.displayName])

  if (isLoading) {
    return (
      <div className="section-shell pb-12">
        <div className="hero-panel mx-auto max-w-5xl">
          <div className="flex items-center justify-center gap-3 py-16 text-ink/70 dark:text-gray-300">
            <Loader2 className="animate-spin" size={20} />
            Loading your profile...
          </div>
        </div>
      </div>
    )
  }

  const handleEnableNotifications = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const dummySub = { endpoint: 'browser-native', timestamp: Date.now() }
        await subscribeToNotifications(user.uid, dummySub)
        alert('Notifications enabled! You will receive course updates here.')
      }
    } catch (err) {
      console.error('Notification error:', err)
    }
  }

  return (
    <div className="section-shell space-y-8 pb-12">
      <section className="hero-panel mx-auto max-w-5xl">
        <p className="section-kicker">My Profile</p>
        <h1 className="mt-4 text-4xl font-semibold dark:text-gray-100">Welcome, {profileName}</h1>
        <p className="mt-3 text-ink/70 dark:text-gray-300">
          Track your enrollments, completions, certificates, and learning progress in one place.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <p className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink/70 dark:border-gray-700 dark:text-gray-300">
            <Mail size={16} /> {profileData.user?.email || user?.email || 'No email available'}
          </p>
          <p className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm text-ink/70 dark:border-gray-700 dark:text-gray-300">
            <UserRound size={16} /> Last updated: {formatDate(profileData.summary.updatedAt)}
          </p>
          <button 
            onClick={handleEnableNotifications}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10 dark:border-sky-500/20 dark:bg-sky-500/5 dark:text-sky-400"
          >
            <Bell size={16} /> Enable Course Notifications
          </button>
        </div>
      </section>

      {error && (
        <section className="mx-auto max-w-5xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </section>
      )}

      <section className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
        <article className="surface-card flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-primary dark:bg-sky-900/40 dark:text-sky-300">
            <BookOpenCheck size={18} />
          </div>
          <div>
            <p className="text-sm text-ink/70 dark:text-gray-400">Completed Courses</p>
            <p className="text-2xl font-semibold dark:text-gray-100">{profileData.summary.completedCourses}</p>
          </div>
        </article>

        <article className="surface-card flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <Award size={18} />
          </div>
          <div>
            <p className="text-sm text-ink/70 dark:text-gray-400">Certificates Achieved</p>
            <p className="text-2xl font-semibold dark:text-gray-100">{profileData.summary.certificatesAchieved}</p>
          </div>
        </article>

        <article className="surface-card flex items-center gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock3 size={18} />
          </div>
          <div>
            <p className="text-sm text-ink/70 dark:text-gray-400">Hours Learned</p>
            <p className="text-2xl font-semibold dark:text-gray-100">{profileData.summary.hoursLearned}</p>
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
        <article className="surface-card">
          <h2 className="text-2xl font-semibold dark:text-gray-100">Enrolled Courses</h2>
          {profileData.enrolledCourses.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70 dark:text-gray-400">
              No active enrollments yet. Enrolled courses will appear here.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {profileData.enrolledCourses.map((course) => (
                <div key={course.id} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-gray-700">
                  <p className="font-semibold dark:text-gray-100">{course.courseTitle || 'Untitled Course'}</p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                    Enrolled on {formatDate(course.enrolledAt)}
                  </p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                    Status: {course.status || 'enrolled'}
                  </p>
                  <Link
                    to={`/learn/${course.courseSlug || course.id}`}
                    className="mt-2 inline-flex text-sm font-semibold text-primary hover:text-accent dark:text-sky-400 dark:hover:text-sky-300"
                  >
                    Continue learning
                  </Link>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="surface-card">
          <h2 className="text-2xl font-semibold dark:text-gray-100">Completed Courses</h2>
          {profileData.completedCourses.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70 dark:text-gray-400">
              No completed courses yet. Once the learner completes a course, it will appear here.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {profileData.completedCourses.map((course) => (
                <div key={course.id} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-gray-700">
                  <p className="font-semibold dark:text-gray-100">{course.title || 'Untitled Course'}</p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                    Completed on {formatDate(course.completedAt)}
                  </p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                    Score: {course.score ?? 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="surface-card">
          <h2 className="text-2xl font-semibold dark:text-gray-100">Certificates</h2>
          {profileData.certificates.length === 0 ? (
            <p className="mt-3 text-sm text-ink/70 dark:text-gray-400">
              No certificates issued yet. Earned certificates will be listed here.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {profileData.certificates.map((certificate) => (
                <div key={certificate.id} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-gray-700">
                  <p className="font-semibold dark:text-gray-100">{certificate.title || 'Course Certificate'}</p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                    Issued on {formatDate(certificate.issuedAt)}
                  </p>
                  <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                    Credential ID: {certificate.credentialId || 'N/A'}
                  </p>
                  {certificate.regNo && (
                    <p className="mt-1 text-sm text-ink/70 dark:text-gray-400">
                      Reg No: {certificate.regNo}
                    </p>
                  )}
                  {certificate.startingDate && (
                    <p className="mt-1 text-xs text-ink/60 dark:text-gray-500">
                      Period: {certificate.startingDate} - {certificate.endingDate}
                    </p>
                  )}
                  
                  {certificate.type === 'manual' && (
                    <button
                      onClick={async () => {
                        const baseFileName = `Certificate_${profileName.replace(/\s+/g, '_')}_${certificate.regNo || 'download'}`
                        await generatePptxCertificate({
                          templateUrl: '/certificate_template.pptx',
                          data: {
                            name: profileName,
                            coursename: certificate.title,
                            startingdate: certificate.startingDate,
                            endingdate: certificate.endingDate,
                            issuedate: formatDate(certificate.issuedAt),
                            'reg.no': certificate.regNo
                          },
                          outputName: `${baseFileName}.pptx`
                        })
                      }}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent dark:text-sky-400 dark:hover:text-sky-300"
                    >
                      <Award size={14} />
                      Download PPTX
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  )
}

export default Profile
