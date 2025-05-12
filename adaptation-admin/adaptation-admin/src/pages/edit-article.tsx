import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ArticleEditor } from '@/components/article-editor'

export function EditArticlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { articles, updateArticle } = useStore()
  const article = articles.find((a) => a.id === id)

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    content: '',
  })

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        category: article.category,
        tags: article.tags.join(', '),
        content: article.content,
      })
    }
  }, [article])

  if (!article) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Статья не найдена</h2>
          <p className="mt-2 text-muted-foreground">
            Запрашиваемая статья не существует или была удалена.
          </p>
          <Button asChild className="mt-4">
            <Link to="/knowledge">К списку статей</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateArticle({
      ...article,
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()),
      updatedAt: new Date().toISOString(),
    })
    navigate(`/knowledge/${article.id}`)
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
                Редактировать статью
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/knowledge/${article.id}`)}
            >
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
              Сохранить изменения
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
} 