import { notFound } from "next/navigation";
import PublicLayout from "@/components/PublicLayout";
import { blogList, blogPosts } from "@/lib/blogData";

export const revalidate = 300;

export function generateStaticParams() {
  return blogList.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    return {
      title: "Satta King 24 Blog - Satta King 24"
    };
  }

  return {
    title: `${post.metaTitle} - Satta King 24`,
    description: post.metaDescription,
    keywords: post.keyword,
    alternates: { canonical: `/blogs/${slug}` }
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = blogPosts[slug];

  if (!post) {
    notFound();
  }

  return (
    <PublicLayout>
      <main className="sk24-blog-page">
        <div className="content blog-detail-content">
          <h1>{post.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      </main>
    </PublicLayout>
  );
}
