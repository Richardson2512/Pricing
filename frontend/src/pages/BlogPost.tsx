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
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col">
      <SEO
        title={post.meta_title}
        description={post.meta_description}
        keywords={post.meta_keywords?.join(', ')}
        canonicalUrl={post.canonical_url || `https://howmuchshouldiprice.com/blog/${post.slug}`}
        ogType="article"
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section with Featured Image */}
        <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-br from-olive-600 to-olive-800 overflow-hidden">
          {/* Stock Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60"></div>
          
          {/* Featured Image (if available) */}
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
            />
          ) : (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
          )}
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-end max-w-4xl mx-auto px-6 md:px-8 pb-12 md:pb-16">
            {/* Category Badge */}
            {post.category && (
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-olive-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {post.category.name}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-beige-100 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time_minutes} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <span>By {post.author_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-olive-600 hover:text-olive-700 mb-8 transition font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>

          {/* Article Body */}
          <article className="bg-white rounded-xl shadow-sm border border-[rgba(0,0,0,0.1)] p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none
                [&>p]:text-[#030213] [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:font-normal
                [&>h2]:text-2xl [&>h2]:font-medium [&>h2]:text-[#030213] [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:leading-snug
                [&>h3]:text-xl [&>h3]:font-medium [&>h3]:text-[#030213] [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:leading-snug
                [&>h4]:text-lg [&>h4]:font-medium [&>h4]:text-[#030213] [&>h4]:mt-8 [&>h4]:mb-3
                [&>blockquote]:border-l-4 [&>blockquote]:border-olive-600 [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:italic [&>blockquote]:text-[#717182] [&>blockquote]:my-8
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul]:my-6 [&>ul]:text-[#030213]
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:my-6 [&>ol]:text-[#030213]
                [&>li]:text-base [&>li]:leading-relaxed
                [&>a]:text-blue-600 [&>a]:underline [&>a]:font-medium hover:[&>a]:text-blue-700 hover:[&>a]:no-underline
                [&>strong]:font-semibold [&>strong]:text-[#030213]
                [&>em]:italic
                [&>code]:bg-[#f3f3f5] [&>code]:text-olive-700 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                [&>pre]:bg-[#030213] [&>pre]:text-white [&>pre]:p-6 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag className="w-5 h-5 text-olive-600" />
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.slug}
                      to={`/blog?tag=${tag.slug}`}
                      className="px-3 py-1.5 bg-[#f3f3f5] text-[#030213] text-sm font-medium rounded-lg hover:bg-olive-100 hover:text-olive-700 transition"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* CTA Box */}
          <div className="mt-12 bg-gradient-to-br from-olive-600 to-olive-700 rounded-xl p-8 md:p-10 text-center shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Price Your Project?
            </h3>
            <p className="text-beige-100 text-lg mb-6 max-w-2xl mx-auto">
              Get AI-powered pricing recommendations tailored to your specific needs using real market data.
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3.5 bg-white text-olive-600 rounded-lg hover:bg-beige-50 transition font-medium shadow-md hover:shadow-lg"
            >
              Get Started Free
            </button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="bg-white border-t border-[rgba(0,0,0,0.1)] py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <h2 className="text-2xl font-medium text-[#030213] mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    onClick={() => {
                      navigate(`/blog/${relatedPost.slug}`);
                      window.scrollTo(0, 0);
                    }}
                    className="bg-white border border-[rgba(0,0,0,0.1)] rounded-xl p-6 hover:shadow-lg transition cursor-pointer group"
                  >
                    {relatedPost.category && (
                      <span className="inline-block px-3 py-1 bg-[#f3f3f5] text-[#030213] text-xs font-medium rounded-lg mb-3">
                        {relatedPost.category.name}
                      </span>
                    )}
                    <h3 className="text-lg font-medium text-[#030213] mb-2 group-hover:text-olive-600 transition line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-[#717182] text-sm mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-[#717182]">
                      <Clock className="w-4 h-4" />
                      <span>{relatedPost.reading_time_minutes} min read</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

