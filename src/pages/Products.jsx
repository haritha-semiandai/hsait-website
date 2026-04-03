import { ShoppingCart } from 'lucide-react'
import { useMemo, useState } from 'react'

const tabs = ['All', 'Books']

const products = [
  {
    name: 'AI for Smart Students',
    category: 'Books',
    badge: 'New',
    image: '/book.webp',
    buyLink: 'https://amzn.in/d/07pwX65v',
  },
]

function Products() {
  const [activeTab, setActiveTab] = useState('All')

  const visibleProducts = useMemo(() => {
    if (activeTab === 'All') {
      return products
    }

    return products.filter((product) => product.category === activeTab)
  }, [activeTab])

  return (
    <div className="space-y-12 pb-8 sm:space-y-16">
      <section className="section-shell">
        <div className="hero-panel">
          <h1 className="text-4xl font-semibold sm:text-5xl dark:text-gray-100">Learning Products For Builders</h1>
          <p className="mt-4 max-w-3xl text-ink/70 dark:text-gray-300">
            Discover hardware, software, and curated bundles that help you learn faster and build
            portfolio-ready projects.
          </p>
        </div>
      </section>

      <section className="section-shell">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-white text-ink/75 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-sky-500 dark:hover:text-sky-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product.name} className="surface-card p-0">
              <div className="relative rounded-t-2xl border-b border-slate-100 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                <img src={product.image} alt={product.name} className="h-[26rem] w-full rounded-xl object-contain" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary dark:bg-gray-700/90 dark:text-sky-400">
                  {product.badge}
                </span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50 dark:text-gray-400">{product.category}</p>
                <h2 className="mt-2 text-2xl font-semibold dark:text-gray-100">{product.name}</h2>
                {product.buyLink ? (
                  <a
                    href={product.buyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary mt-4 w-full gap-2"
                  >
                    <ShoppingCart size={16} /> Buy Now
                  </a>
                ) : (
                  <button type="button" className="btn-primary mt-4 w-full gap-2">
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Products
