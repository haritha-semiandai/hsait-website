import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="space-y-14 pb-8 sm:space-y-16">
      <section className="section-shell">
        <div className="hero-panel">
          <h1 className="text-4xl font-semibold sm:text-5xl dark:text-gray-100">Haritha Semiconductors and AI Technologies</h1>
          <p className="mt-4 max-w-3xl text-ink/70 dark:text-gray-300">
            A forward-looking deep-tech startup focused on the convergence of semiconductor engineering and artificial intelligence. We specialize in designing and developing intelligent hardware systems that combine advanced electronics with AI-driven capabilities.
          </p>
        </div>
      </section>

      <section className="section-shell grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-semibold dark:text-gray-100">Our Mission</h2>
          <p className="mt-4 text-ink/70 dark:text-gray-300">
            We bridge the gap between traditional engineering and modern AI technologies while building innovative products that contribute to the future of smart devices, automation, and sustainable technology.
          </p>
          <p className="mt-3 text-ink/70 dark:text-gray-300">
            By integrating semiconductors with intelligence, we aim to position ourselves as a key player in the next generation of technological innovation. Our solutions create impactful, scalable, and efficient systems that transform industries.
          </p>
          <p className="mt-3 text-ink/70 dark:text-gray-300">
            We're passionate about deep-tech innovation and committed to developing cutting-edge semiconductor and AI solutions that drive the future of intelligent systems.
          </p>
        </div>
        <img
          src="/founder.jpg"
          alt="Founder of Haritha Semiconductors"
          className="w-full rounded-3xl border border-slate-200 object-cover shadow-sm dark:border-gray-700"
        />
      </section>

      <section className="section-shell">
        <div className="hero-panel">
          <div className="text-center">
            <h2 className="text-3xl font-semibold dark:text-gray-100">Our Founder & Vision</h2>
            <p className="mt-2 text-ink/70 dark:text-gray-300">
              Led by industry experts with deep experience in semiconductor design and artificial intelligence, Haritha was founded with a clear vision: to create intelligent hardware systems that solve real-world challenges through the convergence of advanced electronics and AI.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link to="/services" className="btn-primary gap-2">
                Explore Our Services <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn-secondary">View Products</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
