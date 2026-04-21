import type { Article } from '@/lib/supabase/types'
import { ArticleCard } from '@/components/cards/ArticleCard'
import { SectionHead } from './SectionHead'

export function LatestArticles({ articles }: { articles: Article[] }) {
  const featured = articles[0]
  const side = articles.slice(1, 4)
  const bottom = articles.slice(4, 7)

  return (
    <div>
      <SectionHead
        title="Právě vyšlo"
        sub={`${articles.length} nových článků tento týden`}
        linkHref="/dna"
        linkLabel="Archiv"
      />

      {/* Main grid: featured (1.5fr) + side stack (1fr) */}
      {featured && (
        <div
          className="grid gap-5 mb-5"
          style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}
        >
          <ArticleCard article={featured} variant="featured" imageLabel="Generace vs. Generace" />
          <div className="flex flex-col gap-5">
            {side.map((a) => (
              <ArticleCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
        </div>
      )}

      {/* Sub grid: 3 articles */}
      {bottom.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {bottom.map((a) => (
            <ArticleCard key={a.id} article={a} variant="grid" />
          ))}
        </div>
      )}
    </div>
  )
}
