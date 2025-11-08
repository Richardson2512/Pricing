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

      <main className="flex-1 py-12 md:py-20">
        {/* Main Content Container */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative">
          {/* White Content Box */}
          <div className="bg-white rounded-[30px] shadow-2xl p-8 md:p-16 relative">
            {/* Top Dashed Line */}
            <div className="w-full max-w-[332px] h-px border-t border-dashed border-black mx-auto mb-8"></div>

            {/* Publish Date */}
            <div className="text-center mb-8">
              <p className="font-serif text-sm text-[#222222]">
                {formatDate(post.published_at)}
              </p>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl md:text-[28px] leading-[37px] uppercase text-center text-black mb-12 max-w-[900px] mx-auto">
              {post.title}
            </h1>

            {/* Article Content */}
            <div 
              className="max-w-[900px] mx-auto space-y-8
                [&>p]:font-serif [&>p]:text-base [&>p]:leading-8 [&>p]:text-black [&>p]:mb-6
                [&>h2]:font-serif [&>h2]:text-3xl [&>h2]:md:text-[38px] [&>h2]:leading-[51px] [&>h2]:font-bold [&>h2]:text-center [&>h2]:uppercase [&>h2]:text-black [&>h2]:my-12
                [&>h3]:font-serif [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-black [&>h3]:my-8
                [&>blockquote]:font-serif [&>blockquote]:text-3xl [&>blockquote]:md:text-[38px] [&>blockquote]:leading-[51px] [&>blockquote]:font-bold [&>blockquote]:text-center [&>blockquote]:uppercase [&>blockquote]:text-black [&>blockquote]:my-12
                [&>ul]:font-serif [&>ul]:text-base [&>ul]:leading-8 [&>ul]:text-black [&>ul]:list-disc [&>ul]:pl-8 [&>ul]:space-y-2
                [&>ol]:font-serif [&>ol]:text-base [&>ol]:leading-8 [&>ol]:text-black [&>ol]:list-decimal [&>ol]:pl-8 [&>ol]:space-y-2
                [&>a]:text-blue-600 [&>a]:underline hover:[&>a]:text-blue-700
                [&>strong]:font-semibold [&>strong]:text-black
                [&>em]:italic
                [&>code]:bg-slate-100 [&>code]:text-olive-700 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                [&>pre]:bg-slate-900 [&>pre]:text-slate-100 [&>pre]:p-6 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>pre]:my-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Decorative Lines */}
            <div className="relative my-16 h-32 hidden md:block">
              <div className="absolute right-[10%] top-0 w-[397px] max-w-[40%] h-[25px] bg-[rgba(107,122,62,0.1)] rounded-full"></div>
              <div className="absolute left-[10%] top-8 w-[253px] max-w-[30%] h-[25px] bg-[rgba(107,122,62,0.1)] rounded-full"></div>
            </div>

            {/* References Box */}
            <div className="bg-white rounded-[30px] border-2 border-slate-200 p-6 md:p-8 mt-16 relative shadow-md">
              <div className="flex flex-col md:flex-row items-start gap-6">
                {/* Search Icon */}
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 flex items-center justify-center bg-olive-600 rounded-full">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Vertical Line */}
                <div className="hidden md:block w-px h-32 bg-black"></div>
                
                {/* References Text */}
                <div className="flex-1">
                  <h4 className="font-serif font-bold text-lg mb-2">References:</h4>
                  <p className="font-serif text-sm leading-8 text-[#222222]">
                    {post.tags && post.tags.length > 0 
                      ? post.tags.map(tag => tag.name).join(', ')
                      : 'Additional research materials and sources available upon request. This article is based on industry best practices and expert analysis.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Dashed Line */}
            <div className="mt-16 mb-8 w-full max-w-[332px] h-px border-t border-dashed border-black mx-auto"></div>

            {/* Page Number */}
            <div className="text-center relative">
              <span className="font-serif text-base text-black">•</span>
              <div className="w-1.5 h-1.5 bg-olive-600 rounded-full mx-auto mt-2"></div>
            </div>
          </div>

          {/* Back Button - Outside white box */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-olive-600 hover:text-olive-700 mt-8 transition font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Blog</span>
          </button>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  onClick={() => {
                    navigate(`/blog/${relatedPost.slug}`);
                    window.scrollTo(0, 0);
                  }}
                  className="bg-white shadow-lg hover:shadow-xl transition cursor-pointer group rounded-none"
                >
                  <div className="p-6">
                    {relatedPost.category && (
                      <span className="inline-block px-3 py-1 bg-olive-100 text-olive-700 text-xs font-semibold rounded-full mb-3">
                        {relatedPost.category.name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-olive-600 transition line-clamp-2">
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

