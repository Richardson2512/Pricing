import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  author_name: string;
  reading_time_minutes: number;
  published_at: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string[];
  canonical_url: string | null;
  focus_keyword: string;
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    setLoading(true);

    // Load main post
    const { data: postData, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(name, slug),
        tags:blog_post_tags(tag:blog_tags(name, slug))
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (postData && !error) {
      const formattedPost = {
        ...postData,
        tags: postData.tags?.map((t: any) => t.tag) || []
      };
      setPost(formattedPost);

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (postData.view_count || 0) + 1 })
        .eq('id', postData.id);

      // Load related posts
      if (postData.category_id) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, reading_time_minutes, category:blog_categories(name)')
          .eq('category_id', postData.category_id)
          .eq('status', 'published')
          .neq('id', postData.id)
          .limit(3);
        
        if (related) setRelatedPosts(related);
      }
    }

    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-olive-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading article...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Article Not Found</h1>
            <p className="text-slate-600 mb-8">The article you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/blog')}
              className="px-6 py-3 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition"
            >
              Back to Blog
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <SEO
        title={post.meta_title}
        description={post.meta_description}
        keywords={post.meta_keywords?.join(', ')}
        canonicalUrl={post.canonical_url || `https://howmuchshouldiprice.com/blog/${post.slug}`}
        ogType="article"
      />
      <Header />

      <main className="flex-1">
        {/* Back Button */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-olive-600 hover:text-olive-700 font-medium mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </button>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Category Badge */}
          {post.category && (
            <Link
              to={`/blog?category=${post.category.slug}`}
              className="inline-block px-4 py-2 bg-olive-100 text-olive-700 text-sm font-semibold rounded-full mb-4 hover:bg-olive-200 transition"
            >
              {post.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-8 pb-8 border-b border-beige-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-olive-600" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-olive-600" />
              <span>{post.reading_time_minutes} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">By {post.author_name}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-700 prose-a:text-olive-600 prose-strong:text-slate-800 prose-ul:text-slate-700 prose-ol:text-slate-700"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-beige-200">
              <div className="flex items-center gap-3 flex-wrap">
                <Tag className="w-5 h-5 text-olive-600" />
                {post.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    to={`/blog?tag=${tag.slug}`}
                    className="px-3 py-1 bg-beige-100 text-slate-700 text-sm rounded-full hover:bg-olive-100 hover:text-olive-700 transition"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Box */}
          <div className="mt-12 bg-gradient-to-r from-olive-600 to-olive-700 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Price Your Project?
            </h3>
            <p className="text-beige-100 mb-6">
              Get AI-powered pricing recommendations tailored to your specific project.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-white text-olive-600 rounded-lg hover:bg-beige-50 transition font-semibold"
            >
              Get Started Free
            </button>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-beige-200">
            <h2 className="text-3xl font-bold text-slate-800 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  className="bg-white rounded-xl p-6 border border-beige-200 hover:shadow-lg transition cursor-pointer group"
                >
                  {relatedPost.category && (
                    <span className="inline-block px-3 py-1 bg-olive-100 text-olive-700 text-xs font-semibold rounded-full mb-3">
                      {relatedPost.category.name}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-olive-600 transition line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>{relatedPost.reading_time_minutes} min read</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

