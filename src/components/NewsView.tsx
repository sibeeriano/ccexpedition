import { useTranslation } from "react-i18next";
import {
  getNewsPost,
  getNewsPostsSorted,
  type NewsPost,
} from "../data/news";
import { formatNewsDate, pickLocalized } from "../utils/news";

type NewsViewProps = {
  slug?: string;
  onOpenPost: (slug: string) => void;
};

function NewsImages({
  post,
  afterParagraph,
  lang,
}: {
  post: NewsPost;
  afterParagraph: number;
  lang: "es" | "en";
}) {
  const images =
    post.images?.filter((image) => image.afterParagraph === afterParagraph) ??
    [];

  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {images.map((image) => (
        <figure
          key={image.src}
          className="mx-auto w-1/2 min-w-[10rem] overflow-hidden rounded-md border border-white/10"
        >
          <img
            src={image.src}
            alt={pickLocalized(image.alt, lang)}
            className="w-full object-cover"
          />
          {image.caption && (
            <figcaption className="px-2 py-1.5 text-center text-xs text-zinc-500">
              {pickLocalized(image.caption, lang)}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function NewsPostCard({
  post,
  onOpen,
}: {
  post: NewsPost;
  onOpen: () => void;
}) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language === "es" ? "es" : "en";

  return (
    <article className="panel-surface flex flex-col gap-2 px-4 py-4 text-white sm:px-5 sm:py-5">
      <time
        dateTime={post.date}
        className="text-xs font-medium text-zinc-500"
      >
        {formatNewsDate(post.date, lang)}
      </time>
      <h2 className="text-base font-semibold text-white sm:text-lg">
        {pickLocalized(post.title, lang)}
      </h2>
      <p className="text-sm leading-relaxed text-white/85">
        {pickLocalized(post.excerpt, lang)}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-1 self-start text-sm font-medium text-brand-accent transition-colors hover:text-brand-accent/80"
      >
        {t("news.readMore")} →
      </button>
    </article>
  );
}

function NewsPostDetail({
  post,
  onBack,
}: {
  post: NewsPost;
  onBack: () => void;
}) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language === "es" ? "es" : "en";

  return (
    <article className="panel-surface flex flex-col gap-4 px-4 py-5 text-white sm:px-6 sm:py-6">
      <button
        type="button"
        onClick={onBack}
        className="self-start text-xs text-zinc-500 transition-colors hover:text-zinc-200"
      >
        ← {t("news.backToList")}
      </button>
      <time
        dateTime={post.date}
        className="text-xs font-medium text-zinc-500"
      >
        {formatNewsDate(post.date, lang)}
      </time>
      <h1 className="text-xl font-bold text-white sm:text-2xl">
        {pickLocalized(post.title, lang)}
      </h1>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-white sm:text-base">
        {post.body.map((paragraph, index) => (
          <div key={index} className="flex flex-col gap-3">
            <p className="text-white">{pickLocalized(paragraph, lang)}</p>
            <NewsImages post={post} afterParagraph={index} lang={lang} />
          </div>
        ))}
      </div>
    </article>
  );
}

export function NewsView({ slug, onOpenPost }: NewsViewProps) {
  const { t } = useTranslation();
  const posts = getNewsPostsSorted();
  const activePost = slug ? getNewsPost(slug) : undefined;

  return (
    <section className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold text-white sm:text-xl">
          {t("news.title")}
        </h1>
        <p className="text-sm text-zinc-400">{t("news.subtitle")}</p>
      </div>

      {activePost ? (
        <NewsPostDetail post={activePost} onBack={() => onOpenPost("")} />
      ) : slug && !activePost ? (
        <div className="panel-surface px-4 py-8 text-center text-sm text-zinc-400">
          {t("news.notFound")}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <NewsPostCard
              key={post.id}
              post={post}
              onOpen={() => onOpenPost(post.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
