import { Menu, X, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Products', path: '/products' },
  { label: 'Courses', path: '/courses' },
  { label: 'About', path: '/about' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { user, signOutUser } = useAuth()

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }

    window.addEventListener('resize', closeOnResize)
    return () => window.removeEventListener('resize', closeOnResize)
  }, [])

  const navClass = ({ isActive }) =>
    `rounded-full px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
        : 'text-ink/70 hover:bg-slate-100 hover:text-ink dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
    }`

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-950/95">
      <nav className="section-shell flex h-18 items-center justify-between py-4">
        <NavLink to="/" className="inline-flex items-center" onClick={() => setIsOpen(false)}>
          <img src="/logo.png" alt="Haritha Semiconductors and AI Tech" className="h-12 w-auto md:h-14" />
        </NavLink>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-ink transition hover:bg-slate-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <>
              {(user.email === 'harithasemiconductorsandaitech@gmail.com' || user.role === 'instructor') && (
                <Link to="/admin" className="btn-secondary">
                  {user.email === 'harithasemiconductorsandaitech@gmail.com' ? 'Admin Tools' : 'Instructor Tools'}
                </Link>
              )}
              <Link to="/profile" className="btn-primary">My Profile</Link>
              <span className="text-sm font-medium text-ink/70 dark:text-gray-300">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={signOutUser}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/signin?mode=signup" className="btn-primary">Sign In / Sign Up</Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-ink transition hover:bg-slate-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-ink md:hidden dark:border-gray-600 dark:text-gray-300"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-5 pt-4 md:hidden dark:border-gray-700 dark:bg-gray-950">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={navClass}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-3">
              {user ? (
                <>
                  {(user.email === 'harithasemiconductorsandaitech@gmail.com' || user.role === 'instructor') && (
                    <Link to="/admin" className="btn-secondary flex-1" onClick={() => setIsOpen(false)}>
                      {user.email === 'harithasemiconductorsandaitech@gmail.com' ? 'Admin' : 'Instructor'}
                    </Link>
                  )}
                  <Link to="/profile" className="btn-primary flex-1" onClick={() => setIsOpen(false)}>
                    My Profile
                  </Link>
                  <button
                    type="button"
                    className="btn-secondary flex-1"
                    onClick={() => {
                      signOutUser()
                      setIsOpen(false)
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/signin?mode=signup" className="btn-primary flex-1" onClick={() => setIsOpen(false)}>
                  Sign In / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
