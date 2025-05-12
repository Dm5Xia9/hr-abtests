import { Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Article } from '@/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function KnowledgeBasePage() {
  const { articles } = useStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">База знаний</h1>
          <p className="text-muted-foreground">
            Полезные статьи и документация для сотрудников
          </p>
        </div>
        <Button asChild>
          <Link to="/knowledge/new">
            <Plus className="mr-2 h-4 w-4" />
            Создать статью
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={`/knowledge/${article.id}`}
      className="group relative rounded-lg border p-4 hover:border-foreground/50"
    >
      <div className="space-y-2">
        <h2 className="font-semibold tracking-tight">{article.title}</h2>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            {article.category}
          </span>
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary/10 px-2 py-1 text-xs text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{article.author}</span>
          <span>•</span>
          <span>
            {format(new Date(article.updatedAt), 'd MMMM yyyy', { locale: ru })}
          </span>
        </div>
      </div>
    </Link>
  )
} 