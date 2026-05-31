import { Search, Star, Award, Loader2 } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { courses } from '../data/courses'
import { useAuth } from '../context/AuthContext'
import { getDynamicCourses } from '../services/databaseService'

const categoryOptions = ['All', 'AI', 'VLSI', 'Security']
const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced']

function Courses() {
  const { user } = useAuth()
  const isInstructor = user?.role === 'instructor' || user?.email === 'harithasemiconductorsandaitech@gmail.com'
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [search, setSearch] = useState('')
  const [dynamicCourses, setDynamicCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getDynamicCourses()
      .then((list) => {
        if (isMounted) {
          setDynamicCourses(list)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        console.error('Error loading dynamic courses:', err)
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const allCourses = useMemo(() => {
    const merged = [...courses]
    dynamicCourses.forEach((dyn) => {
      const idx = merged.findIndex((c) => c.slug === dyn.slug)
      if (idx > -1) {
        merged[idx] = { ...merged[idx], ...dyn }
      } else {
        merged.push(dyn)
      }
    })
    return merged
  }, [dynamicCourses])

  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesCategory = category === 'All' || course.category === category
      const matchesDifficulty = difficulty === 'All' || course.difficulty === difficulty
      const query = search.trim().toLowerCase()
      const matchesSearch = (course.title || '').toLowerCase().includes(query) || (course.instructor || '').toLowerCase().includes(query)

      return matchesCategory && matchesDifficulty && matchesSearch
    })
  }, [category, difficulty, search, allCourses])

  return (
    <div className="space-y-10 pb-8 sm:space-y-14">
      <section className="section-shell">
        <div className="hero-panel">
          <h1 className="text-4xl font-semibold sm:text-5xl dark:text-gray-100">Find The Right Course For Your Next Leap</h1>
          <p className="mt-3 max-w-3xl text-ink/70 dark:text-gray-300">
            Filter by category, skill level, and goals. Every program includes guided projects and mentor support.
          </p>

          {isInstructor && (
            <div className="mt-4">
              <Link
                to="/admin"
                className="btn-primary inline-flex items-center gap-2 shadow-md shadow-primary/20"
              >
                <Award size={16} /> Instructor Dashboard (Manage Courses & Classes)
              </Link>
            </div>
          )}

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="input-clean"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="input-clean"
            >
              {difficultyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <label className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/50 dark:text-gray-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses or instructors"
                className="input-clean pl-10 pr-3"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="section-shell">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center gap-3 text-ink/60 dark:text-gray-400">
            <Loader2 className="animate-spin text-primary" size={24} /> Syncing courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-ink/50 dark:text-gray-400 font-medium">
            No courses found matching your criteria.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <article key={course.slug} className="surface-card p-0">
                <div className="relative">
                  <img src={course.image || '/ai-foundation.jpg'} alt={course.title} className="h-44 w-full rounded-t-2xl object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary dark:bg-slate-700/90 dark:text-sky-400">
                    {course.difficulty}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="text-2xl font-semibold leading-tight dark:text-slate-100">{course.title}</h2>
                  <p className="mt-1 text-sm text-ink/65 dark:text-slate-400">Instructor: {course.instructor}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Star size={14} className="fill-amber-500" /> {course.rating}
                    </span>
                    <span className="text-ink/65 dark:text-slate-400">{course.duration}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary dark:text-sky-400">{course.price}</p>
                    <Link to={`/courses/${course.slug}`} className="btn-primary">View Course</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Courses
