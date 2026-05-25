import Link from "next/link";
import PublicLayout from "@/components/PublicLayout";
import { blogList, blogListMeta } from "@/lib/blogData";

export const revalidate = 300;
export const metadata = {
  title: `${blogListMeta.title} - Satta King 24`,
  description: blogListMeta.description,
  keywords: blogListMeta.keyword,
  alternates: { canonical: "/blogs" }
};

export default function BlogsPage() {
  return (
    <PublicLayout>
      <main className="sk24-blog-page">
        <div className="content">
          {blogList.map((post) => (
            <Link className="post_list" href={`/blogs/${post.slug}`} title="" key={post.slug}>
              <div className="blogsidebar"><div>{post.title}</div></div>
            </Link>
          ))}
        </div>
      </main>
    </PublicLayout>
  );
}
