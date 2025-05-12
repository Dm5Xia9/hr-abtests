import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { ArticleEditor } from '@/components/article-editor'

export function CreateArticlePage() {
  const navigate = useNavigate()
  const { createArticle } = useStore()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    content: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createArticle({
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()),
      author: 'HR Department', // В реальном приложении здесь будет текущий пользователь
    })
    navigate('/knowledge')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b bg-background p-6">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">
                Создать статью
              </h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/knowledge')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Теги (через запятую)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="например: onboarding, культура, правила"
              />
            </div>

            <div className="space-y-2">
              <Label>Содержание</Label>
              <ArticleEditor
                content={formData.content}
                onChange={(content) =>
                  setFormData((prev) => ({ ...prev, content }))
                }
              />
            </div>

            <Button type="submit" className="w-full">
              Создать статью
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 