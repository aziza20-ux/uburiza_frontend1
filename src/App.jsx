import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import LearnerDashboard from './views/LearnerDashboard';
import MyCourses from './views/MyCourses';
import ResourceLibrary from './views/ResourceLibrary';
import ResourceUpload from './views/ResourceUpload';
import CertificateView from './views/CertificateView';
import OperationalAnalytics from './views/OperationalAnalytics';
import AdminManagementForms from './views/AdminManagementForms';
import LandingPage from './views/LandingPage';
import CourseCatalog from './views/CourseCatalog';
import CourseOverview from './views/CourseOverview';
import CourseMaterial from './views/CourseMaterial';
import PaymentPage from './views/PaymentPage';
import Login from './views/Login';
import Signup from './views/Signup';
import SettingsView from './views/SettingsView';
import VerifyEmail from './views/VerifyEmail';
import AccessCodesView from './views/AccessCodesView';
import ForgotPassword from './views/ForgotPassword';
import ResetPassword from './views/ResetPassword';
import { AppProvider, useAppContext } from './context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';

function getInitialRoute() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const email = params.get('email');

  if (token && email && window.location.pathname.includes('reset-password')) {
    return {
      view: 'ResetPassword',
      resetParams: { token, email },
    };
  }

  return {
    view: window.location.hash.replace('#', '') || 'LandingPage',
    resetParams: { token: '', email: '' },
  };
}

function AppContent() {
  const initialRoute = getInitialRoute();

  const [view, setViewInternal] = useState(() => initialRoute.view);

  const [pendingEmail, setPendingEmail] = useState(() => sessionStorage.getItem('pendingEmail') ?? '');

  const setPendingEmailPersisted = (email) => {
    sessionStorage.setItem('pendingEmail', email);
    setPendingEmail(email);
  };
  const [resetParams, setResetParams] = useState(() => initialRoute.resetParams);
  const [editCourseId, setEditCourseId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [paymentCourse, setPaymentCourse] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setView = (newView) => {
    setViewInternal(newView);
    if (window.location.hash !== `#${newView}`) {
      window.location.hash = newView;
    }
  };

  useEffect(() => {
    // Handle reset-password links: /reset-password?token=...&email=...
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    if (token && email && window.location.pathname.includes('reset-password')) {
      setResetParams({ token, email });
      setViewInternal('ResetPassword');
      return;
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setViewInternal(hash || 'LandingPage');
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    const handleSelectLesson = (e) => {
      setSelectedLessonId(e.detail);
      setViewInternal('CourseMaterial');
    };
    window.addEventListener('selectLesson', handleSelectLesson);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('selectLesson', handleSelectLesson);
    };
  }, []);

  const { userRole } = useAppContext();
  const isAdmin = userRole === 'admin';

  const renderView = () => {
    // Redirect admin away from learner-only views
    if (isAdmin && ['Dashboard', 'MyCourses', 'Certificate'].includes(view)) {
      return <OperationalAnalytics setView={setView} />;
    }
    switch(view) {
      case 'Dashboard':
        return <LearnerDashboard setView={setView} onSelectCourse={(id) => { setSelectedCourseId(id); setView('CourseOverview'); }} />;
      case 'MyCourses':
        return <MyCourses setView={setView} onSelectCourse={(id) => { setSelectedCourseId(id); setView('CourseOverview'); }} />;
      case 'Resources':
        return <ResourceLibrary setView={setView} />;
      case 'ResourceUpload':
        return <ResourceUpload setView={setView} />;
      case 'Certificate':
        return <CertificateView setView={setView} />;
      case 'Analytics':
        return <OperationalAnalytics setView={setView} />;
      case 'AdminForms':
        return <AdminManagementForms setView={setView} editCourseId={editCourseId} onEditDone={() => setEditCourseId(null)} />;
      case 'AccessCodes':
        return <AccessCodesView />;
      case 'Settings':
        return <SettingsView setView={setView} />;
      case 'LandingPage':
        return <LandingPage setView={setView} />;
      case 'CourseCatalog':
        return <CourseCatalog setView={setView} onEditCourse={(id) => { setEditCourseId(id); setView('AdminForms'); }} onSelectCourse={(id) => { setSelectedCourseId(id); setView('CourseOverview'); }} />;
      case 'CourseOverview':
        return <CourseOverview view={view} setView={setView} courseId={selectedCourseId} onSelectLesson={(id) => { setSelectedLessonId(id); setView('CourseMaterial'); }} onPayCourse={(course) => { setPaymentCourse(course); setView('Payment'); }} />;
      case 'Payment':
        return <PaymentPage course={paymentCourse} setView={setView} onSuccess={() => { setSelectedLessonId(null); setView('CourseMaterial'); }} />;
      case 'CourseMaterial':
        return <CourseMaterial view={view} setView={setView} lessonId={selectedLessonId} courseId={selectedCourseId} />;
      case 'Login':
        return <Login setView={setView} setPendingEmail={setPendingEmailPersisted} />;
      case 'Signup':
        return <Signup setView={setView} setPendingEmail={setPendingEmailPersisted} />;
      case 'VerifyEmail':
        return <VerifyEmail setView={setView} email={pendingEmail} />;
      case 'ForgotPassword':
        return <ForgotPassword setView={setView} />;
      case 'ResetPassword':
        return <ResetPassword setView={setView} token={resetParams.token} email={resetParams.email} />;
      case 'PartnerWithUs':
        return <PartnerWithUs setView={setView} />;
      case 'TeachWithUs':
        return <TeachWithUs setView={setView} />;
      case 'BusinessInquiry':
        return <BusinessInquiry setView={setView} />;
      default:
        return <LandingPage setView={setView} />;
    }
  };

  const isFullPageView = ['LandingPage', 'CourseCatalog', 'CourseOverview', 'CourseMaterial', 'Payment', 'Login', 'Signup', 'VerifyEmail', 'ForgotPassword', 'ResetPassword'].includes(view);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  if (isFullPageView) {
    return (
      <div className="font-sans min-h-screen transition-colors duration-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-sans overflow-hidden bg-white h-screen transition-colors duration-300">
      <TopNav view={view} setView={setView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar view={view} setView={setView} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
