import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Heart } from 'react-feather';
import { useArticle } from '../../hooks/queries';

type ArticleBlockProps = {
  tag: string;
  text: string;
};

type InfoRowProps = {
  label: string;
  children: ReactNode;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

function InfoRow({ label, children }: Readonly<InfoRowProps>) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800 dark:text-slate-100">{children}</dd>
    </div>
  );
}

function splitListItems(text: string) {
  return text
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function ArticleBlock({ tag, text }: Readonly<ArticleBlockProps>) {
  const normalizedTag = tag.toLowerCase();
  const className = 'whitespace-pre-wrap text-base leading-8 text-slate-700 dark:text-slate-200';

  switch (normalizedTag) {
    case 'h1':
      return <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-950 first:mt-0 dark:text-slate-50">{text}</h1>;
    case 'h2':
      return <h2 className="mt-8 text-2xl font-bold leading-tight text-slate-950 first:mt-0 dark:text-slate-50">{text}</h2>;
    case 'h3':
      return <h3 className="mt-7 text-xl font-semibold leading-tight text-slate-900 first:mt-0 dark:text-slate-100">{text}</h3>;
    case 'h4':
      return <h4 className="mt-6 text-lg font-semibold leading-tight text-slate-900 first:mt-0 dark:text-slate-100">{text}</h4>;
    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-slate-600 dark:border-indigo-500 dark:text-slate-300">{text}</blockquote>
      );
    case 'ul':
      return (
        <ul className="list-disc space-y-2 pl-6 text-base leading-8 text-slate-700 dark:text-slate-200">
          {splitListItems(text).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="list-decimal space-y-2 pl-6 text-base leading-8 text-slate-700 dark:text-slate-200">
          {splitListItems(text).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case 'li':
      return (
        <ul className="list-disc pl-6 text-base leading-8 text-slate-700 dark:text-slate-200">
          <li>{text}</li>
        </ul>
      );
    default:
      return <p className={className}>{text}</p>;
  }
}

function ReadingPage() {
  const { id } = useParams();
  const articleId = Number(id);
  const isValidArticleId = Number.isInteger(articleId) && articleId > 0;
  const { data: article, isLoading, isError } = useArticle(articleId);

  if (!isValidArticleId) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-800 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
        Invalid article id.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
        Loading article...
      </div>
    );
  }

  if (isError || !article?.content) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
        Article content not found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
      <aside className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1 className="m-0 text-xl font-bold leading-tight text-slate-950 dark:text-slate-50">{article.title}</h1>
            {article.liked ? (
              <Heart className="mt-1 shrink-0 text-red-500 dark:text-red-400" size={20} fill="currentColor" aria-label="Liked" />
            ) : null}
          </div>

          {article.summary ? <p className="m-0 text-sm leading-6 text-slate-600 dark:text-slate-300">{article.summary}</p> : null}
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow label="Author">{article.author}</InfoRow>
          <InfoRow label="Year">{article.year}</InfoRow>
          <InfoRow label="Status">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {article.consulted ? 'Consulted' : 'Not consulted'}
              </span>
              {article.read_later ? (
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                  Read later
                </span>
              ) : null}
            </div>
          </InfoRow>
          <InfoRow label="Tags">
            {article.tags.length ? (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">No tags</span>
            )}
          </InfoRow>
          <InfoRow label="Created">{formatDate(article.date_creation)}</InfoRow>
          <InfoRow label="Updated">{formatDate(article.date_modification)}</InfoRow>
          <InfoRow label="Source">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Open article
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </InfoRow>
        </dl>
      </aside>

      <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 sm:p-8">
        {article.content.length ? (
          <div className="space-y-5">
            {article.content.map((block, index) => (
              <ArticleBlock key={`${block.tag}-${index}`} tag={block.tag} text={block.text} />
            ))}
          </div>
        ) : (
          <p className="m-0 text-slate-600 dark:text-slate-300">No content available for this article.</p>
        )}
      </article>
    </div>
  );
}

export default ReadingPage;
