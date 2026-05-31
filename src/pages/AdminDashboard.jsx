import { useState, useEffect } from 'react'
import { 
  getAllUsers, 
  issueCertificateToUser, 
  getAllNotificationSubscriptions,
  savePushNotification,
  createLiveClassWithNotifications,
  updateRecordedLink,
  getLiveClasses,
  getCourseEnrollments,
  getClassFeedback,
  updateUserRole,
  getDynamicCourses,
  saveDynamicCourse
} from '../services/databaseService'
import { useAuth } from '../context/AuthContext'
import { generatePptxCertificate } from '../services/certificateService'
import { courses } from '../data/courses'
import { 
  Loader2, CheckCircle2, AlertCircle, Users, User, Clock, 
  FileDown, Layers, Send, Calendar, Video, BellRing, Info, 
  Plus, History, ExternalLink, Play, GraduationCap, Star, MessageSquare, X, Check,
  BookOpen, Trash2
} from 'lucide-react'

function AdminDashboard() {
  const { user } = useAuth()
  const isSuperAdmin = user?.email === 'harithasemiconductorsandaitech@gmail.com'

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState('courses') 

  useEffect(() => {
    if (!isSuperAdmin && !['classes', 'reports', 'courses'].includes(mode)) {
      setMode('courses')
    }
  }, [isSuperAdmin, mode])
  const [status, setStatus] = useState({ type: '', message: '' })

  // Course Builder state
  const [dynamicCourses, setDynamicCourses] = useState([])
  const [allCourses, setAllCourses] = useState(courses)
  const [courseForm, setCourseForm] = useState({
    slug: '',
    title: '',
    instructor: '',
    rating: 4.8,
    duration: '',
    estimatedHours: 30,
    price: 'Contact for details',
    difficulty: 'Beginner',
    category: 'AI',
    image: '',
    description: '',
    learningOutcomes: [''],
    curriculum: [''],
    certificateName: ''
  })
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [editingCourseSlug, setEditingCourseSlug] = useState(null)
  
  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [formData, setFormData] = useState({
    courseSlug: '',
    startingDate: '',
    endingDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    regNoPrefix: '', 
    regNo: '', 
  })

  // Live classes management
  const [liveClassForm, setLiveClassForm] = useState({
    courseSlug: '',
    title: '',
    description: '',
    classLink: ''
  })
  const [activeCourseClasses, setActiveCourseClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState('')
  const [recordedForm, setRecordedForm] = useState('')
  
  // Reporting state
  const [reportingCourseSlug, setReportingCourseSlug] = useState('')
  const [courseEnrollments, setCourseEnrollments] = useState([])
  const [classFeedback, setClassFeedback] = useState([])
  const [viewingFeedbackFor, setViewingFeedbackFor] = useState(null)

  // Notifications state
  const [notifForm, setNotifForm] = useState({ title: '', message: '', url: '' })
  const [subscriptionsCount, setSubscriptionsCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let usersList = []
        let subsList = []
        let dynList = []

        if (isSuperAdmin) {
          const [uList, sList, dList] = await Promise.all([
            getAllUsers(),
            getAllNotificationSubscriptions(),
            getDynamicCourses()
          ])
          usersList = uList
          subsList = sList
          dynList = dList
        } else {
          dynList = await getDynamicCourses()
        }

        setUsers(usersList)
        setSubscriptionsCount(subsList.length)
        setDynamicCourses(dynList)
        
        // Merge dynamic and static courses
        const merged = [...courses]
        dynList.forEach(dyn => {
          const idx = merged.findIndex(c => c.slug === dyn.slug)
          if (idx > -1) {
            merged[idx] = { ...merged[idx], ...dyn }
          } else {
            merged.push(dyn)
          }
        })
        setAllCourses(merged)
      } catch (err) {
        setStatus({ type: 'error', message: 'Initialization failed: ' + err.message })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [isSuperAdmin])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    )
  }

  // --- Class Management Logic ---
  const handleLiveClassSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createLiveClassWithNotifications(liveClassForm)
      setStatus({ type: 'success', message: `Class "${liveClassForm.title}" is now live! Notifications sent to enrolled students.` })
      const list = await getLiveClasses(liveClassForm.courseSlug)
      setActiveCourseClasses(list)
      setLiveClassForm({ ...liveClassForm, title: '', description: '', classLink: '' })
    } catch (err) { setStatus({ type: 'error', message: err.message }) }
    finally { setIsLoading(false) }
  }

  const selectCourseForClasses = async (slug) => {
    setLiveClassForm(p => ({ ...p, courseSlug: slug }))
    if (!slug) { setActiveCourseClasses([]); return; }
    setIsLoading(true)
    try { setActiveCourseClasses(await getLiveClasses(slug)) } 
    catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleUpdateRecorded = async (classId) => {
    if (!recordedForm) return
    setIsLoading(true)
    try {
      await updateRecordedLink(liveClassForm.courseSlug, classId, recordedForm)
      setStatus({ type: 'success', message: 'Recording updated.' })
      setRecordedForm(''); setSelectedClassId('')
      setActiveCourseClasses(await getLiveClasses(liveClassForm.courseSlug))
    } catch (err) { setStatus({ type: 'error', message: err.message }) }
    finally { setIsLoading(false) }
  }

  // --- Reporting Logic ---
  const handleLoadReports = async (slug) => {
    setReportingCourseSlug(slug)
    if (!slug) { setCourseEnrollments([]); return; }
    setIsLoading(true)
    try { setCourseEnrollments(await getCourseEnrollments(slug)) }
    catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleViewFeedback = async (cls) => {
    setViewingFeedbackFor(cls)
    setIsLoading(true)
    try { setClassFeedback(await getClassFeedback(liveClassForm.courseSlug, cls.id)) }
    catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  // --- Push Logic ---
  const handlePushNotification = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await savePushNotification(notifForm)
      setStatus({ type: 'success', message: `Broadcasting triggered for ${subscriptionsCount} devices.` })
      setNotifForm({ title: '', message: '', url: '' })
    } catch (err) { setStatus({ type: 'error', message: err.message }) }
    finally { setIsLoading(false) }
  }

  // --- Certificate Logic ---
  const handleCertSubmit = async (e) => {
    e.preventDefault()
    if (!formData.courseSlug) return setStatus({ type: 'error', message: 'Select course.' })
    setIsLoading(true)
    try {
      const selectedCourse = allCourses.find(c => c.slug === formData.courseSlug)
      const targetUsers = users.filter(u => selectedUserIds.includes(u.id))
      for (let i = 0; i < targetUsers.length; i++) {
        const user = targetUsers[i]
        const currentRegNo = mode === 'batch' ? `${formData.regNoPrefix}${i + 1}` : formData.regNo
        await issueCertificateToUser({ userId: user.id, courseTitle: selectedCourse.title, courseSlug: formData.courseSlug, ...formData, regNo: currentRegNo })
        await generatePptxCertificate({ templateUrl: '/certificate_template.pptx', data: { name: user.displayName || 'Learner', coursename: selectedCourse.title, ...formData, 'reg.no': currentRegNo, issuedate: formData.issueDate }, outputName: `Cert_${user.displayName.replace(/\s+/g, '_')}.pptx` })
      }
      setStatus({ type: 'success', message: 'Sequence complete.' })
      setSelectedUserIds([]); setFormData(p => ({ ...p, regNo: '', regNoPrefix: '' }))
    } catch (err) { setStatus({ type: 'error', message: err.message }) }
    finally { setIsLoading(false) }
  }
  // --- Course Builder Logic ---
  const handleSaveCourse = async (e) => {
    e.preventDefault()
    if (!courseForm.title || !courseForm.slug) {
      setStatus({ type: 'error', message: 'Title and Slug are required.' })
      return
    }
    
    setIsLoading(true)
    try {
      // Clean outcomes and curriculum arrays of empty values
      const cleanedForm = {
        ...courseForm,
        learningOutcomes: courseForm.learningOutcomes.filter(o => o.trim() !== ''),
        curriculum: courseForm.curriculum.filter(c => c.trim() !== ''),
        estimatedHours: Number(courseForm.estimatedHours) || 0,
        rating: Number(courseForm.rating) || 4.8
      }
      
      await saveDynamicCourse(cleanedForm)
      setStatus({ type: 'success', message: `Course "${courseForm.title}" saved successfully!` })
      
      // Reload dynamic courses
      const list = await getDynamicCourses()
      setDynamicCourses(list)
      
      // Update merged courses list
      const merged = [...courses]
      list.forEach(dyn => {
        const idx = merged.findIndex(c => c.slug === dyn.slug)
        if (idx > -1) {
          merged[idx] = { ...merged[idx], ...dyn }
        } else {
          merged.push(dyn)
        }
      })
      setAllCourses(merged)
      setIsEditingCourse(false)
      setEditingCourseSlug(null)
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to save course: ' + err.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCourseClick = (courseItem) => {
    setCourseForm({
      slug: courseItem.slug || '',
      title: courseItem.title || '',
      instructor: courseItem.instructor || '',
      rating: courseItem.rating || 4.8,
      duration: courseItem.duration || '',
      estimatedHours: courseItem.estimatedHours || 30,
      price: courseItem.price || 'Contact for details',
      difficulty: courseItem.difficulty || 'Beginner',
      category: courseItem.category || 'AI',
      image: courseItem.image || '',
      description: courseItem.description || '',
      learningOutcomes: courseItem.learningOutcomes?.length ? [...courseItem.learningOutcomes] : [''],
      curriculum: courseItem.curriculum?.length ? [...courseItem.curriculum] : [''],
      certificateName: courseItem.certificateName || ''
    })
    setEditingCourseSlug(courseItem.slug)
    setIsEditingCourse(true)
  }

  const handleAddCourseClick = () => {
    setCourseForm({
      slug: '',
      title: '',
      instructor: '',
      rating: 4.8,
      duration: '',
      estimatedHours: 30,
      price: 'Contact for details',
      difficulty: 'Beginner',
      category: 'AI',
      image: '',
      description: '',
      learningOutcomes: [''],
      curriculum: [''],
      certificateName: ''
    })
    setEditingCourseSlug(null)
    setIsEditingCourse(true)
  }

  const handleCourseFormChange = (e) => {
    const { name, value } = e.target
    setCourseForm(prev => ({ ...prev, [name]: value }))
  }

  // Update dynamic outcome fields
  const handleOutcomeChange = (index, value) => {
    setCourseForm(prev => {
      const outcomes = [...prev.learningOutcomes]
      outcomes[index] = value
      return { ...prev, learningOutcomes: outcomes }
    })
  }

  const addOutcomeField = () => {
    setCourseForm(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, '']
    }))
  }

  const removeOutcomeField = (index) => {
    setCourseForm(prev => {
      const outcomes = prev.learningOutcomes.filter((_, idx) => idx !== index)
      return { ...prev, learningOutcomes: outcomes.length ? outcomes : [''] }
    })
  }

  // Update dynamic curriculum/module fields
  const handleCurriculumChange = (index, value) => {
    setCourseForm(prev => {
      const items = [...prev.curriculum]
      items[index] = value
      return { ...prev, curriculum: items }
    })
  }

  const addCurriculumField = () => {
    setCourseForm(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, '']
    }))
  }

  const removeCurriculumField = (index) => {
    setCourseForm(prev => {
      const items = prev.curriculum.filter((_, idx) => idx !== index)
      return { ...prev, curriculum: items.length ? items : [''] }
    })
  }

  if (isLoading && users.length === 0) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>

  return (
    <div className="section-shell pb-20">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight dark:text-white">Admin Hub</h1>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { id: 'courses', icon: BookOpen, label: 'Manage Courses' },
              { id: 'classes', icon: Video, label: 'Live Classes' },
              { id: 'reports', icon: GraduationCap, label: 'Enrollments' },
              { id: 'single', icon: User, label: 'Single Cert', superOnly: true },
              { id: 'batch', icon: Users, label: 'Batch Certs', superOnly: true },
              { id: 'notifications', icon: BellRing, label: 'Broadcast', superOnly: true },
              { id: 'roles', icon: Layers, label: 'Manage Roles', superOnly: true }
            ].filter(tab => !tab.superOnly || isSuperAdmin).map(tab => (
              <button key={tab.id} onClick={() => setMode(tab.id)} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm ${mode === tab.id ? 'bg-primary text-white' : 'bg-white text-ink/70 dark:bg-gray-800'}`}>
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </div>
        </header>

        {status.message && <div className={`mb-8 p-5 rounded-2xl border flex items-center gap-4 ${status.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'}`}><CheckCircle2 size={22} /><p className="font-semibold">{status.message}</p></div>}

        {/* Course Builder Mode */}
        {mode === 'courses' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95">
            {!isEditingCourse ? (
              <div className="surface-card">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold dark:text-white">Courses & Modules Manager</h2>
                    <p className="text-xs text-ink/40 dark:text-gray-400 mt-1">Add or update course content and student modules</p>
                  </div>
                  <button 
                    onClick={handleAddCourseClick}
                    className="btn-primary inline-flex items-center gap-2 shadow-md shadow-primary/10"
                  >
                    <Plus size={16} /> Add New Course
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-800 text-ink/40 uppercase tracking-widest text-[10px]">
                        <th className="pb-3 px-2">Course Name</th>
                        <th className="pb-3 px-2">Instructor</th>
                        <th className="pb-3 px-2">Duration</th>
                        <th className="pb-3 px-2">Category</th>
                        <th className="pb-3 px-2">Modules</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {allCourses.map(c => {
                        const moduleCount = (c.learningOutcomes?.length || 0) + (c.curriculum?.length || 0)
                        return (
                          <tr key={c.slug} className="group hover:bg-slate-50 transition-colors dark:hover:bg-gray-800/50">
                            <td className="py-4 px-2 font-bold dark:text-gray-200">{c.title}</td>
                            <td className="py-4 px-2 text-ink/65">{c.instructor}</td>
                            <td className="py-4 px-2 text-ink/65">{c.duration}</td>
                            <td className="py-4 px-2">
                              <span className="bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 px-2.5 py-1 rounded text-[10px] font-bold">
                                {c.category}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-ink/65">{moduleCount} items</td>
                            <td className="py-4 px-2 text-right">
                              <button 
                                onClick={() => handleEditCourseClick(c)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-accent dark:text-sky-400 dark:hover:text-sky-300 transition-colors bg-sky-50 dark:bg-sky-950/40 px-3 py-1.5 rounded-lg"
                              >
                                Edit Course
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="surface-card">
                <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-800">
                  <h2 className="text-xl font-bold dark:text-white">
                    {editingCourseSlug ? `Edit Course: ${courseForm.title}` : 'Add New Course'}
                  </h2>
                  <button 
                    onClick={() => { setIsEditingCourse(false); setEditingCourseSlug(null); }}
                    className="text-sm font-bold text-ink/40 hover:text-ink/60 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleSaveCourse} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Course Title</label>
                      <input 
                        type="text" 
                        name="title"
                        value={courseForm.title} 
                        onChange={(e) => {
                          const title = e.target.value
                          setCourseForm(prev => ({
                            ...prev,
                            title,
                            slug: editingCourseSlug ? prev.slug : title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                          }))
                        }}
                        className="input-clean" 
                        placeholder="e.g. AI Foundation" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Course Slug</label>
                      <input 
                        type="text" 
                        name="slug"
                        value={courseForm.slug} 
                        onChange={handleCourseFormChange}
                        disabled={editingCourseSlug !== null}
                        className="input-clean disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-gray-800" 
                        placeholder="e.g. ai-foundation" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Instructor Name</label>
                      <input 
                        type="text" 
                        name="instructor"
                        value={courseForm.instructor} 
                        onChange={handleCourseFormChange}
                        className="input-clean" 
                        placeholder="e.g. N Anvesh Raju" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Duration</label>
                      <input 
                        type="text" 
                        name="duration"
                        value={courseForm.duration} 
                        onChange={handleCourseFormChange}
                        className="input-clean" 
                        placeholder="e.g. 45 days" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Estimated Hours</label>
                      <input 
                        type="number" 
                        name="estimatedHours"
                        value={courseForm.estimatedHours} 
                        onChange={handleCourseFormChange}
                        className="input-clean" 
                        placeholder="e.g. 45" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Category</label>
                      <select 
                        name="category"
                        value={courseForm.category} 
                        onChange={handleCourseFormChange}
                        className="input-clean"
                        required
                      >
                        <option value="AI">AI</option>
                        <option value="VLSI">VLSI</option>
                        <option value="Security">Security</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Difficulty</label>
                      <select 
                        name="difficulty"
                        value={courseForm.difficulty} 
                        onChange={handleCourseFormChange}
                        className="input-clean"
                        required
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Price Details</label>
                      <input 
                        type="text" 
                        name="price"
                        value={courseForm.price} 
                        onChange={handleCourseFormChange}
                        className="input-clean" 
                        placeholder="e.g. Contact for details" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Image Path / URL</label>
                      <input 
                        type="text" 
                        name="image"
                        value={courseForm.image} 
                        onChange={handleCourseFormChange}
                        className="input-clean" 
                        placeholder="e.g. /ai-foundation.jpg" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Certificate Name</label>
                      <input 
                        type="text" 
                        name="certificateName"
                        value={courseForm.certificateName} 
                        onChange={handleCourseFormChange}
                        className="input-clean" 
                        placeholder="e.g. AI Foundation Completion Certificate" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-gray-400">Course Description</label>
                    <textarea 
                      name="description"
                      value={courseForm.description} 
                      onChange={handleCourseFormChange}
                      rows="3"
                      className="input-clean resize-none" 
                      placeholder="Enter course summary..." 
                      required 
                    />
                  </div>

                  {/* Modules - Learning Outcomes */}
                  <div className="border-t dark:border-gray-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-ink/70 dark:text-gray-300">Learning Outcomes</h3>
                      <button 
                        type="button" 
                        onClick={addOutcomeField}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent"
                      >
                        <Plus size={14} /> Add Outcome
                      </button>
                    </div>
                    <div className="space-y-3">
                      {courseForm.learningOutcomes.map((outcome, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text"
                            value={outcome}
                            onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                            className="input-clean flex-1"
                            placeholder="Describe what the student will learn..."
                            required
                          />
                          {courseForm.learningOutcomes.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeOutcomeField(idx)}
                              className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modules - Curriculum / Lessons */}
                  <div className="border-t dark:border-gray-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-ink/70 dark:text-gray-300">Curriculum / Modules List</h3>
                      <button 
                        type="button" 
                        onClick={addCurriculumField}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-accent"
                      >
                        <Plus size={14} /> Add Module
                      </button>
                    </div>
                    <div className="space-y-3">
                      {courseForm.curriculum.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input 
                            type="text"
                            value={item}
                            onChange={(e) => handleCurriculumChange(idx, e.target.value)}
                            className="input-clean flex-1"
                            placeholder="Describe a module, topic or milestone..."
                            required
                          />
                          {courseForm.curriculum.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeCurriculumField(idx)}
                              className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t dark:border-gray-800">
                    <button 
                      type="button" 
                      onClick={() => { setIsEditingCourse(false); setEditingCourseSlug(null); }}
                      className="btn-secondary flex-1 py-4 font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn-primary flex-1 py-4 font-bold shadow-xl shadow-primary/20"
                    >
                      Save Course & Modules
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Classes Mode */}
        {mode === 'classes' && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="surface-card">
              <h2 className="mb-6 text-xl font-bold dark:text-white">Create Class</h2>
              <form onSubmit={handleLiveClassSubmit} className="space-y-4">
                 <select className="input-clean" value={liveClassForm.courseSlug} onChange={e => selectCourseForClasses(e.target.value)} required>
                   <option value="">-- Course --</option>{allCourses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                 </select>
                 <input type="text" placeholder="Title" className="input-clean" value={liveClassForm.title} onChange={e => setLiveClassForm(p => ({ ...p, title: e.target.value }))} required />
                 <input type="text" placeholder="Description" className="input-clean" value={liveClassForm.description} onChange={e => setLiveClassForm(p => ({ ...p, description: e.target.value }))} required />
                 <input type="url" placeholder="Zoom Link" className="input-clean" value={liveClassForm.classLink} onChange={e => setLiveClassForm(p => ({ ...p, classLink: e.target.value }))} required />
                 <button className="btn-primary w-full py-4 shadow-lg">Publish Live Class</button>
              </form>
            </div>
            <div className="surface-card h-[600px] overflow-y-auto">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-bold dark:text-white">Class Timeline</h2>
                 <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase tracking-wider">
                   {activeCourseClasses.length} Sessions
                 </span>
               </div>

               {activeCourseClasses.length === 0 ? (
                 <div className="flex h-64 flex-col items-center justify-center text-center opacity-40">
                   <History size={48} className="mb-4" />
                   <p>No classes found for this course.<br/>Select a course to view timeline.</p>
                 </div>
               ) : (
                 <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-20px)] before:w-0.5 before:bg-slate-200 dark:before:bg-gray-800">
                   {activeCourseClasses.map((cls, idx) => (
                     <div key={cls.id} className="relative mb-8 last:mb-0 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${idx * 100}ms` }}>
                       {/* Dot */}
                       <div className={`absolute -left-[27px] top-1.5 z-10 h-4 w-4 rounded-full border-4 border-white dark:border-gray-900 shadow-sm transition-colors ${cls.recordedLink ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} title={cls.recordedLink ? 'Recorded' : 'Live Now'} />
                       
                       <div className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-gray-900/40 dark:hover:bg-gray-800/60">
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                             <div className="max-w-[70%]">
                                <h3 className="font-bold leading-tight dark:text-gray-100">{cls.title}</h3>
                                <p className="mt-1 text-xs text-ink/50 dark:text-gray-400 line-clamp-2">{cls.description}</p>
                             </div>
                             <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${cls.recordedLink ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'}`}>
                                {cls.recordedLink ? 'Recorded' : 'Live Now'}
                             </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-4">
                             {selectedClassId === cls.id ? (
                               <div className="flex w-full animate-in zoom-in-95 gap-2">
                                 <input 
                                   type="url" 
                                   placeholder="Paste recorded link here..."
                                   className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-800" 
                                   value={recordedForm} 
                                   onChange={e => setRecordedForm(e.target.value)} 
                                 />
                                 <button 
                                   onClick={() => handleUpdateRecorded(cls.id)} 
                                   className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-accent"
                                 >
                                   Save
                                 </button>
                                 <button 
                                   onClick={() => {setSelectedClassId(''); setRecordedForm('')}} 
                                   className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-bold text-ink/70 dark:bg-gray-700 dark:text-gray-300"
                                 >
                                   <X size={14}/>
                                 </button>
                               </div>
                             ) : (
                               <>
                                 <button 
                                   onClick={() => {setSelectedClassId(cls.id); setRecordedForm(cls.recordedLink || '')}} 
                                   className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold text-ink/70 shadow-sm border border-slate-100 hover:border-primary/30 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                 >
                                   <Video size={12}/> {cls.recordedLink ? 'Edit Link' : 'Add Link'}
                                 </button>
                                 <button 
                                   onClick={() => handleViewFeedback(cls)} 
                                   className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-[10px] font-bold text-sky-700 shadow-sm border border-sky-100 hover:bg-sky-100 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900/50"
                                 >
                                   <MessageSquare size={12}/> Feedback
                                 </button>
                                 {cls.classLink && (
                                   <a 
                                     href={cls.classLink} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="ml-auto text-primary/40 hover:text-primary transition-colors"
                                     title="Open Zoom Link"
                                   >
                                     <ExternalLink size={16}/>
                                   </a>
                                 )}
                               </>
                             )}
                          </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Reports Mode */}
        {mode === 'reports' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95">
             <div className="surface-card bg-primary/5">
                <label className="text-xs font-bold uppercase text-primary mb-2 block">Course Enrollment Data</label>
                <select className="input-clean" value={reportingCourseSlug} onChange={e => handleLoadReports(e.target.value)}>
                   <option value="">-- Choose Course to see Enrolled Students --</option>
                   {allCourses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                </select>
             </div>
             
             {reportingCourseSlug && (
               <div className="surface-card">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold dark:text-white">Enrolled Students ({courseEnrollments.length})</h3>
                    <div className="text-xs text-ink/40">Real-time data from Firestore</div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead>
                           <tr className="border-b dark:border-gray-800 text-ink/40 uppercase tracking-widest text-[10px]">
                              <th className="pb-3 px-2">Student Name</th>
                              <th className="pb-3 px-2">Email Address</th>
                              <th className="pb-3 px-2">Enrollment Date</th>
                              <th className="pb-3 px-2 text-right">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                           {courseEnrollments.map(enr => (
                             <tr key={enr.id} className="group hover:bg-slate-50 transition-colors dark:hover:bg-gray-800/50">
                                <td className="py-4 px-2 font-bold dark:text-gray-200">{enr.displayName || 'No Name'}</td>
                                <td className="py-4 px-2 text-ink/60">{enr.email}</td>
                                <td className="py-4 px-2 text-ink/60">{(enr.enrolledAt?.toDate?.() || new Date(enr.enrolledAt)).toLocaleDateString()}</td>
                                <td className="py-4 px-2 text-right"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold">ACTIVE</span></td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
             )}
          </div>
        )}

        {/* Single/Batch Certification (Existing Logic) */}
        {(mode === 'single' || mode === 'batch') && (
           <form onSubmit={handleCertSubmit} className="grid gap-8 lg:grid-cols-2 animate-in slide-in-from-right-4">
              <div className="surface-card flex flex-col h-[500px]">
                 <p className="font-bold mb-4 dark:text-white">Choose Students</p>
                 <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {users.map(u => (
                       <div key={u.id} onClick={() => mode === 'single' ? setSelectedUserIds([u.id]) : toggleUserSelection(u.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedUserIds.includes(u.id) ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                          <p className="text-sm font-bold dark:text-gray-100">{u.displayName}</p>
                          <p className="text-[10px] opacity-40">{u.email}</p>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="surface-card space-y-4">
                 <select name="courseSlug" value={formData.courseSlug} onChange={handleInputChange} className="input-clean" required>
                    <option value="">-- Choose Course --</option>{allCourses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
                 </select>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="startingDate" placeholder="Start Date" value={formData.startingDate} onChange={handleInputChange} className="input-clean" required />
                    <input type="text" name="endingDate" placeholder="End Date" value={formData.endingDate} onChange={handleInputChange} className="input-clean" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <input type="date" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="input-clean" required />
                    <input type="text" name={mode === 'single' ? 'regNo' : 'regNoPrefix'} placeholder={mode === 'single' ? 'Reg No' : 'Reg Prefix'} value={mode === 'single' ? formData.regNo : formData.regNoPrefix} onChange={handleInputChange} className="input-clean" required />
                 </div>
                 <button className="btn-primary w-full py-4 shadow-xl">Issue & Download PPTX</button>
              </div>
           </form>
        )}

        {/* Notifications (Existing Logic) */}
        {mode === 'notifications' && (
           <div className="surface-card bg-ink text-white mx-auto max-w-2xl text-center py-12">
              <BellRing size={40} className="mx-auto mb-4 text-sky-400" />
              <h2 className="text-2xl font-bold">Broadcast Console</h2>
              <form onSubmit={handlePushNotification} className="mt-8 space-y-4">
                 <input type="text" placeholder="Title" className="w-full bg-white/10 px-5 py-4 rounded-xl border-none text-white" value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} required />
                 <textarea placeholder="Message" className="w-full bg-white/10 px-5 py-4 rounded-xl border-none text-white" value={notifForm.message} onChange={e => setNotifForm(p => ({ ...p, message: e.target.value }))} required />
                 <button className="btn-primary-sky w-full py-4 font-bold bg-sky-500 rounded-xl">Push to {subscriptionsCount} Devices</button>
              </form>
           </div>
        )}

        {/* Manage Roles Mode */}
        {mode === 'roles' && isSuperAdmin && (
          <div className="space-y-8 animate-in fade-in zoom-in-95">
             <div className="surface-card">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold dark:text-white">Role Management</h3>
                  <div className="text-xs text-ink/40">Assign course administration and teaching privileges</div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm">
                      <thead>
                         <tr className="border-b dark:border-gray-800 text-ink/40 uppercase tracking-widest text-[10px]">
                            <th className="pb-3 px-2">User Name</th>
                            <th className="pb-3 px-2">Email Address</th>
                            <th className="pb-3 px-2">Current Role</th>
                            <th className="pb-3 px-2 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-800">
                         {users.map(u => {
                           const currentRole = u.role || 'student'
                           return (
                             <tr key={u.id} className="group hover:bg-slate-50 transition-colors dark:hover:bg-gray-800/50">
                                <td className="py-4 px-2 font-bold dark:text-gray-200">{u.displayName || 'No Name'}</td>
                                <td className="py-4 px-2 text-ink/60">{u.email}</td>
                                <td className="py-4 px-2">
                                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${currentRole === 'instructor' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' : 'bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                    {currentRole.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-4 px-2 text-right">
                                  {u.email === 'harithasemiconductorsandaitech@gmail.com' ? (
                                    <span className="text-xs text-ink/40 italic">ROOT SUPER ADMIN</span>
                                  ) : (
                                    <select
                                      value={currentRole}
                                      onChange={async (e) => {
                                        const newRole = e.target.value
                                        setIsLoading(true)
                                        try {
                                          await updateUserRole(u.id, newRole)
                                          // Update local state reactively
                                          setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, role: newRole } : usr))
                                          setStatus({ type: 'success', message: `Successfully updated ${u.displayName || u.email}'s role to ${newRole}.` })
                                        } catch (err) {
                                          setStatus({ type: 'error', message: err.message })
                                        } finally {
                                          setIsLoading(false)
                                        }
                                      }}
                                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-primary focus:outline-none dark:border-gray-700 dark:bg-gray-850 dark:text-white"
                                    >
                                      <option value="student">Student</option>
                                      <option value="instructor">Instructor</option>
                                    </select>
                                  )}
                                </td>
                             </tr>
                           )
                         })}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Class Feedback Modal */}
      {viewingFeedbackFor && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm items-center justify-center flex p-4 shadow-2xl animate-in fade-in duration-300">
           <div className="surface-card w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border-none shadow-2xl dark:bg-gray-900">
              <div className="flex justify-between items-center p-6 border-b dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30">
                 <div>
                    <h3 className="text-xl font-bold dark:text-gray-100">Feedback Explorer</h3>
                    <p className="text-xs text-ink/40 dark:text-gray-400 mt-1">Class: {viewingFeedbackFor.title}</p>
                 </div>
                 <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-ink/40" onClick={() => setViewingFeedbackFor(null)}>
                   <X size={24} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {classFeedback.length === 0 ? (
                   <div className="text-center py-20">
                      <div className="h-20 w-20 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare size={32} className="text-ink/10 dark:text-gray-600" />
                      </div>
                      <p className="text-ink/30 dark:text-gray-500 font-medium">No feedback submitted for this session yet.</p>
                   </div>
                 ) : (
                   <div className="grid gap-4">
                     {classFeedback.map(fb => (
                       <div key={fb.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-gray-800/50 border border-slate-100 dark:border-gray-800 hover:border-sky-200 transition-all">
                          <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                 {fb.userName?.charAt(0) || 'L'}
                               </div>
                               <p className="font-bold text-sm dark:text-gray-200">{fb.userName}</p>
                             </div>
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 font-bold text-xs border border-amber-100 dark:border-amber-900/30">
                               <Star size={12} className="fill-amber-600 dark:fill-amber-500" /> {fb.rating}
                             </div>
                          </div>
                          <p className="text-sm leading-relaxed text-ink/70 dark:text-gray-400 italic">"{fb.comment}"</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-gray-800/20 border-t dark:border-gray-800 text-center">
                 <button onClick={() => setViewingFeedbackFor(null)} className="btn-secondary w-full max-w-xs text-xs py-2 shadow-sm">
                   Close Explorer
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
