import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import { initializeApp, loadStoredAuth } from './lib/api-init'
import { ThemeProvider } from './components/theme-provider'
import { Layout } from '@/components/layout'
import { EmployeesPage } from '@/pages/employees'
import { TracksPage } from '@/pages/tracks'
import { CreateTrackPage } from '@/pages/create-track'
import { TrackEditPage } from '@/pages/track-edit'
import { CreateEmployeePage } from '@/pages/create-employee'
import { KnowledgePage } from '@/pages/knowledge'
import { CreateArticlePage } from '@/pages/create-article'
import { ArticleDetailsPage } from '@/pages/article-details'
import { EditArticlePage } from '@/pages/edit-article'
import { ManagementPage } from '@/pages/management'
import { InputExamplesPage } from '@/pages/input-examples'
import { MyMenteesPage } from '@/pages/my-mentees'
import { NotificationsPage } from '@/pages/notifications'
import { MobileNotificationsPage } from '@/pages/mobile-notifications'
import { TrackProgressPage } from '@/pages/track-progress'
import { EmployeeAccessPage } from '@/pages/employee-access'
import AuthPage from '@/pages/Auth'
import CompanyProfilePage from '@/pages/CompanyProfile'
import { Toaster } from './components/toaster'
import { TooltipProvider } from './components/ui/tooltip'
import { TrackGamificationDashboard } from './components/track-gamification-dashboard'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import EmployeeMeetingsPage from '@/pages/employee-meetings'

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { users } = useStore()
  const isAuthenticated = loadStoredAuth() && users.length > 0
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

// Специальная защита для страницы профиля компании, которая не перенаправляет
// на страницу компании, чтобы избежать зацикливания
const CompanyProfileRoute = ({ children }: { children: React.ReactNode }) => {
  const { users } = useStore()
  const isAuthenticated = loadStoredAuth() && users.length > 0
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  
  return <>{children}</>
}

// Guard that requires both authentication and selected company
const CompanyRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { users, currentCompanyProfile } = useStore()
  const isAuthenticated = loadStoredAuth() && users.length > 0
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  
  if (isAuthenticated && !currentCompanyProfile) {
    return <Navigate to="/company-profile" replace />
  }
  
  return <>{children}</>
}

// Component that redirects authenticated users away from login page
const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const { users, currentCompanyProfile } = useStore()
  const isAuthenticated = loadStoredAuth() && users.length > 0
  
  if (isAuthenticated) {
    if (!currentCompanyProfile) {
      return <Navigate to="/company-profile" replace />
    }
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

// Route for employee adaptation track progress
const EmployeeRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

function App() {

  useEffect(() => {
    // Initialize the application with API data
    const initialize = async () => {
      await initializeApp()
    }
    
    initialize()

    // // Set up SignalR connection
    // const hubUrl = "https://diagramm.xyz/api/v2/hubs/notifications";
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZ21haWwucnUiLCJyZWYiOiJjNTk4NWE1OC0xZjI4LTQwODMtYWNjZC0xYWFlODMyNWUzMWEiLCJ1c2kiOiJmODU0MGJjYy1jYzJmLTRlZmEtYWRlOC0zZTY3OTZhMDU4ZTkiLCJqdGkiOiJmZjdjMGU3ZS0wMTc3LTQxNjYtYjVmZC1iNGZmN2IyNzJjNGMiLCJpZC1wZXJtIjpbInNhbGVzLW9mZmljZTpzdXBlci11c2VyIiwiZGlhZ3JhbW06b3Jnc3RydWN0dXJlLndyaXRlIiwiaHJtOmRlbWFuZC5jcmVhdGUiLCJocm06ZGVtYW5kLmFwcHJvdmFsIiwiaHJtOmRlbWFuZC5tYW5hZ2VtZW50IiwiZGlhZ3JhbW06cG9zaXRpb24ucmVhZCIsImRpYWdyYW1tOnBvc2l0aW9uLndyaXRlIiwiZGlhZ3JhbW06ZW1wbG95ZXJzLnJlYWQiLCJkaWFncmFtbTplbXBsb3llcnMud3JpdGUiLCJocm06YXBwbGljYXRpb25zLnJlamVjdGlvbiIsImhybTp2YWNhbmNpZXMiLCJocm06YXBwb2ludG1lbnQtcmVjcnVpdGVyIiwiaHJtOmFsbC1zdGFnZXMiLCJocm06Y2FuZGlkYXRlLWNvbW11bmljYXRpb24iLCJocm06Y2hhbmdlLXN0YWdlIiwiaHJtOnNldHRpbmdzIiwiaHJtOnJlYWQtYWxsLWRlbWFuZHMiLCJAaHJtOmFkbWluIiwiaHJtOm1lc3NhZ2UtdGVtcGxhdGUucmVmdXNhbCIsImhybTptZXNzYWdlLXRlbXBsYXRlLmludGVydmlldyIsIkB5YW1pLXBob3RvczphZG1pbiJdLCJzeXN0ZW0iOlsiaHJtIiwic2FsZXMtb2ZmaWNlIiwieWFtaS1waG90b3MiXSwiZXhwIjoxNzQ3Mjk1NzQ5LCJpc3MiOiJkaWFncmFtbS1zc28iLCJhdWQiOiJkaWFncmFtbS1zc28ifQ.yGdfJWay4175n0dOfVeTPEieu7VrEnRCx4-D4blcgdQ";

    // // Configure connection with authorization
    // const connection = new HubConnectionBuilder()
    //   .withUrl(hubUrl, {
    //     headers: {
    //       "Authorization": `Bearer ${token}`
    //     }
    //   })
    //   .configureLogging(LogLevel.Error) // Equivalent to LogLevel.Error
    //   .build();

    // // Start the connection
    // connection.start()
    //   .then(() => console.log("Connection established"))
    //   .catch((err: Error) => console.error("Error establishing connection:", err));

    // // Clean up connection on unmount
    // return () => {
    //   connection.stop();
    // };
  }, [])
  
  // Show loading state while initializing
  // if (isLoading && !error) {
  //   return (
  //     <div className="h-screen w-full flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Загрузка данных...</p>
  //       </div>
  //     </div>
  //   )
  // }
  
  // Show error state if initialization failed
  // if (error) {
  //   return (
  //     <div className="h-screen w-full flex items-center justify-center">
  //       <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
  //         <h2 className="text-xl font-semibold text-red-700 mb-2">Ошибка инициализации</h2>
  //         <p className="text-red-600 mb-4">{error}</p>
  //         <button 
  //           className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
  //           onClick={() => window.location.reload()}
  //         >
  //           Попробовать снова
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/auth" element={<RedirectIfAuthenticated><AuthPage /></RedirectIfAuthenticated>} />
            <Route path="/company-profile" element={<CompanyProfileRoute><CompanyProfilePage /></CompanyProfileRoute>} />
            
            {/* Employee public access routes */}
            <Route path="/access/:accessLink" element={<EmployeeAccessPage />} />
            
            {/* Protected routes inside layout */}
            <Route path="/" element={
              <CompanyRequiredRoute>
                <Layout>
                  <EmployeesPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/employees" element={
              <CompanyRequiredRoute>
                <Layout>
                  <EmployeesPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/employees/new" element={
              <CompanyRequiredRoute>
                <Layout>
                  <CreateEmployeePage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/tracks" element={
              <CompanyRequiredRoute>
                <Layout>
                  <TracksPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/tracks/new" element={
              <CompanyRequiredRoute>
                <Layout>
                  <CreateTrackPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/tracks/:id/edit" element={
              <CompanyRequiredRoute>
                <Layout>
                  <TrackEditPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/knowledge" element={
              <CompanyRequiredRoute>
                <Layout>
                  <KnowledgePage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/knowledge/create" element={
              <CompanyRequiredRoute>
                <Layout>
                  <CreateArticlePage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/knowledge/:id" element={
              <CompanyRequiredRoute>
                <Layout>
                  <ArticleDetailsPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/knowledge/:id/edit" element={
              <CompanyRequiredRoute>
                <Layout>
                  <EditArticlePage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/management" element={
              <CompanyRequiredRoute>
                <Layout>
                  <ManagementPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/my-mentees" element={
              <CompanyRequiredRoute>
                <Layout>
                  <MyMenteesPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/notifications" element={
              <CompanyRequiredRoute>
                <Layout>
                  <NotificationsPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/input-examples" element={
              <CompanyRequiredRoute>
                <Layout>
                  <InputExamplesPage />
                </Layout>
              </CompanyRequiredRoute>
            } />
            <Route path="/game" element={
              <CompanyRequiredRoute>
                <Layout>
                  <TrackGamificationDashboard />
                </Layout>
              </CompanyRequiredRoute>
            } />
            
            {/* Mobile specific routes */}
            <Route path="/mobile-notifications" element={
              <EmployeeRoute>
                <MobileNotificationsPage />
              </EmployeeRoute>
            } />
            
            {/* Employee meetings route */}
            <Route path="/employee-meetings" element={
              <EmployeeRoute>
                <EmployeeMeetingsPage />
              </EmployeeRoute>
            } />
            
            {/* Backward compatibility for old calendar route */}
            <Route path="/employee-calendar" element={
              <Navigate to="/employee-meetings" replace />
            } />
            
            {/* Employee track progress route */}
            <Route path="/passage" element={
              <EmployeeRoute>
                <TrackProgressPage />
              </EmployeeRoute>
            } />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App 