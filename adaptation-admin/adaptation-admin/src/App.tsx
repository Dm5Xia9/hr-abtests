import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Layout } from '@/components/layout'
import { EmployeesPage } from '@/pages/employees'
import { TracksPage } from '@/pages/tracks'
import { TrackDetailsPage } from '@/pages/track-details'
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
import { Toaster } from '@/components/toaster'

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<EmployeesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/new" element={<CreateEmployeePage />} />
            <Route path="/tracks" element={<TracksPage />} />
            <Route path="/tracks/new" element={<CreateTrackPage />} />
            <Route path="/tracks/:id" element={<TrackDetailsPage />} />
            <Route path="/tracks/:id/edit" element={<TrackEditPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/knowledge/create" element={<CreateArticlePage />} />
            <Route path="/knowledge/:id" element={<ArticleDetailsPage />} />
            <Route path="/knowledge/:id/edit" element={<EditArticlePage />} />
            <Route path="/management" element={<ManagementPage />} />
            <Route path="/my-mentees" element={<MyMenteesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/input-examples" element={<InputExamplesPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
} 