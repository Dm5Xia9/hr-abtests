import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
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

export function KnowledgePage() {
  const navigate = useNavigate()
  const { articles } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const uniqueCategories = new Set(articles.map((article) => article.category))
    return Array.from(uniqueCategories)
  }, [articles])

  const filteredArticles = articles.filter((article) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      article.title.toLowerCase().includes(searchLower) ||
      article.category.toLowerCase().includes(searchLower) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      article.content.toLowerCase().includes(searchLower)

    const matchesCategory =
      !selectedCategory || article.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getTagColor = (tag: string) => {
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return TAG_COLORS[index % TAG_COLORS.length]
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">База знаний</h1>
        <Button size="sm" onClick={() => navigate('/knowledge/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Создать статью
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по статьям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            Все категории
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="group relative rounded-lg border p-4 hover:border-foreground/50 transition-colors"
          >
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold leading-none tracking-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {article.category}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
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
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{article.author}</span>
                <span>
                  {format(new Date(article.updatedAt), 'd MMM yyyy', {
                    locale: ru,
                  })}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="absolute inset-0 h-full w-full opacity-0"
              onClick={() => navigate(`/knowledge/${article.id}`)}
            >
              <span className="sr-only">Открыть статью</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
} 