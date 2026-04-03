import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationListener from './components/NotificationListener'

const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Products = lazy(() => import('./pages/Products'))
const Courses = lazy(() => import('./pages/Courses'))
const CourseDetails = lazy(() => import('./pages/CourseDetails'))
const LearnCourse = lazy(() => import('./pages/LearnCourse'))
const About = lazy(() => import('./pages/About'))
const SignIn = lazy(() => import('./pages/SignIn'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const Profile = lazy(() => import('./pages/Profile'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))

function App() {
  return (
    <div className="min-h-screen bg-mesh text-ink font-body dark:bg-mesh-dark dark:text-gray-100">
      <Navbar />
      <NotificationListener />
      <main className="pt-24 sm:pt-28">
        <Suspense
          fallback={(
            <div className="section-shell pb-12">
              <div className="hero-panel mx-auto max-w-5xl py-14 text-center text-ink/70 dark:text-gray-300">
                Loading page...
              </div>
            </div>
          )}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route
              path="/learn/:slug"
              element={(
                <ProtectedRoute>
                  <LearnCourse />
                </ProtectedRoute>
              )}
            />
            <Route path="/about" element={<About />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin"
              element={(
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
