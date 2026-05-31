import { Instagram, Linkedin, Mail, Globe2, Send, Users } from 'lucide-react'
import { createElement } from 'react'
import { Link } from 'react-router-dom'

const linkGroups = [
  {
    title: 'Platform',
    links: ['Courses', 'Mentors', 'Community', 'Pricing'],
  },
  {
    title: 'Resources',
    links: ['Blog', 'Guides', 'Events', 'Support'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Partners', 'Contact'],
  },
]

const socials = [
  { 
    icon: Linkedin, 
    label: 'LinkedIn', 
    url: 'https://www.linkedin.com/company/haritha-semiconductors-and-ai-technologies/' 
  },
  { 
    icon: Instagram, 
    label: 'Instagram', 
    url: 'https://www.instagram.com/hsait_?igsh=OGx6dTVuazB3OXNv' 
  },
  { 
    icon: Mail, 
    label: 'Email', 
    url: 'mailto:harithasemiconductorsandaitech@gmail.com' 
  },
]

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-950">
      <div className="section-shell grid gap-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <img
            src="/logo.png"
            alt="Haritha Semiconductors and AI Tech"
            className="h-16 w-auto"
          />
          <h3 className="text-2xl font-semibold text-ink dark:text-gray-100">Build skills that move your career forward.</h3>
          <p className="mt-3 max-w-md text-ink/70 dark:text-gray-400">
            Learn from real practitioners, earn recognized credentials, and join a global
            network of ambitious learners.
          </p>
          <div className="mt-6 flex items-center gap-2">
            {socials.map(({ icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-ink/70 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-400 dark:hover:border-sky-500 dark:hover:text-sky-400"
                aria-label={label}
              >
                {createElement(icon, { size: 16 })}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title}>
              <p className="font-display text-lg font-semibold text-ink dark:text-gray-100">{group.title}</p>
              <ul className="mt-3 space-y-2 text-ink/70 dark:text-gray-400">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition hover:text-primary dark:hover:text-sky-400">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="section-shell mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-ink/60 dark:border-gray-700 dark:text-gray-500">
        <p>
          Copyright {new Date().getFullYear()}. All rights reserved. | by{' '}
          <a
            href="https://rsmk.co.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-block font-display font-bold tracking-wider bg-gradient-to-r from-accent via-primary to-highlight bg-clip-text text-transparent hover:brightness-110 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] group"
          >
            RSMK
            <span className="absolute -bottom-0.5 left-0 w-full h-[1.5px] bg-gradient-to-r from-accent via-primary to-highlight transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />
          </a>
        </p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-primary dark:hover:text-sky-400">Privacy</Link>
          <Link to="/terms" className="hover:text-primary dark:hover:text-sky-400">Terms</Link>
          <Link to="/signin" className="hover:text-primary dark:hover:text-sky-400">Sign In</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
