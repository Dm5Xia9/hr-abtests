import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const TAG_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-red-100 text-red-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-orange-100 text-orange-800',
]

export function ArticleDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { articles } = useStore()
  const article = articles.find((a) => a.id === id)

  const getTagColor = (tag: string) => {
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return TAG_COLORS[index % TAG_COLORS.length]
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{article.author}</span>
            <span>•</span>
            <span>
              {format(new Date(article.updatedAt), 'd MMMM yyyy', { locale: ru })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(`/knowledge/${article.id}/edit`)} variant="outline">
            <Pencil className="mr-2 h-4 w-4" />
            Редактировать
          </Button>
          <Button variant="outline" onClick={() => navigate('/knowledge')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К списку статей
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {article.category}
        </span>
        {article.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-2 py-1 text-xs font-medium ${getTagColor(
              tag
            )}`}
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  )
} 