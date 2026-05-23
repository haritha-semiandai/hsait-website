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
  updateUserRole
} from '../services/databaseService'
import { useAuth } from '../context/AuthContext'
import { generatePptxCertificate } from '../services/certificateService'
import { courses } from '../data/courses'
import { 
  Loader2, CheckCircle2, AlertCircle, Users, User, Clock, 
  FileDown, Layers, Send, Calendar, Video, BellRing, Info, 
  Plus, History, ExternalLink, Play, GraduationCap, Star, MessageSquare, X, Check
} from 'lucide-react'

function AdminDashboard() {
  const { user } = useAuth()
  const isSuperAdmin = user?.email === 'harithasemiconductorsandaitech@gmail.com'

  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState('classes') 

  useEffect(() => {
    if (!isSuperAdmin && !['classes', 'reports'].includes(mode)) {
      setMode('classes')
    }
  }, [isSuperAdmin, mode])
  const [status, setStatus] = useState({ type: '', message: '' })
  
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
        const [usersList, subs] = await Promise.all([
          getAllUsers(),
          getAllNotificationSubscriptions()
        ])
        setUsers(usersList)
        setSubscriptionsCount(subs.length)
      } catch (err) {
        setStatus({ type: 'error', message: 'Initialization failed: ' + err.message })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

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
      const selectedCourse = courses.find(c => c.slug === formData.courseSlug)
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

  if (isLoading && users.length === 0) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>

  return (
    <div className="section-shell pb-20">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight dark:text-white">Admin Hub</h1>
          <div className="mt-8 flex flex-wrap gap-2">
            {[
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

        {/* Classes Mode */}
        {mode === 'classes' && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="surface-card">
              <h2 className="mb-6 text-xl font-bold dark:text-white">Create Class</h2>
              <form onSubmit={handleLiveClassSubmit} className="space-y-4">
                 <select className="input-clean" value={liveClassForm.courseSlug} onChange={e => selectCourseForClasses(e.target.value)} required>
                   <option value="">-- Course --</option>{courses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
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
                   {courses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
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
                    <option value="">-- Choose Course --</option>{courses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
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
