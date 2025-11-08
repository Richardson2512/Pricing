import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  author_name: string;
  reading_time_minutes: number;
  published_at: string;
  category: {
    name: string;
    slug: string;
  };
}

export function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadBlogPosts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');
    
    if (data) setCategories(data);
  };

  const loadBlogPosts = async () => {
    setLoading(true);
    
    let query = supabase
      .from('blog_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image_url,
        author_name,
        reading_time_minutes,
        published_at,
        category:blog_categories(name, slug)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (selectedCategory !== 'all') {
      const category = categories.find(c => c.slug === selectedCategory);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    const { data, error } = await query;

    if (data && !error) {
      setPosts(data as any);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadBlogPosts();
  }, [selectedCategory]);

  const filteredPosts = posts.filter(post =>
    searchQuery === '' ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-50 to-beige-100 flex flex-col">
      <SEO
        title="Pricing Guides & Resources | How Much Should I Price for a Project?"
        description="Expert pricing guides for freelancers, entrepreneurs, and businesses. Learn how to price your products, services, and projects with our comprehensive blog articles and pricing strategies."
        keywords="pricing guides, how to price your product, how to price your service, pricing calculator, freelance pricing, pricing strategy"
        canonicalUrl="https://howmuchshouldiprice.com/blog"
      />
      <Header />

      {/* Hero Section */}
      <section className="bg-[#F5F1E8] pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col items-center gap-10">
            {/* Heading and supporting text */}
            <div className="flex flex-col items-center gap-6 max-w-4xl">
              {/* Badge */}
              <div className="flex items-center justify-center px-3 py-1 bg-[#F5F1E8] border border-olive-600 rounded-2xl">
                <span className="text-sm font-medium text-olive-700">Our blog</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-5xl font-semibold text-slate-900 text-center leading-tight tracking-tight">
                Pricing Guides & Resources
              </h1>
              
              {/* Supporting text */}
              <p className="text-xl text-olive-700 text-center">
                Expert advice on how to price your products, services, and freelance work.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-olive-600 focus:border-transparent text-slate-700 placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter - Hidden, using design without filters */}
      <div className="hidden">
        {categories.map((category) => (
          <button key={category.id} onClick={() => setSelectedCategory(category.slug)}>
            {category.name}
          </button>
        ))}
      </div>

      {/* Blog Posts Grid */}
      <section className="bg-[#F5F1E8] pb-24">
        <div className="max-w-7xl mx-auto px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-olive-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-slate-600 mb-4">No articles found</p>
              <p className="text-slate-500">Try adjusting your search</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {filteredPosts.slice(0, 3).map((post) => (
                  <article
                    key={post.id}
                    className="flex flex-col bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer rounded-none"
                    onClick={() => navigate(`/blog/${post.slug}`)}
                  >
                    {/* Image */}
                    <div className="w-full h-60 bg-gradient-to-br from-olive-100 to-beige-100 flex items-center justify-center">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-6xl">📊</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between p-6 gap-8 flex-grow">
                      {/* Heading and subheading */}
                      <div className="flex flex-col gap-3">
                        {/* Category */}
                        {post.category && (
                          <span className="text-sm font-semibold text-olive-700">
                            {post.category.name}
                          </span>
                        )}
                        
                        {/* Heading and text */}
                        <div className="flex flex-col gap-3">
                          {/* Title */}
                          <h2 className="text-2xl font-semibold text-slate-900 leading-8 line-clamp-2">
                            {post.title}
                          </h2>
                          
                          {/* Excerpt */}
                          <p className="text-base text-slate-500 leading-6 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                      </div>

                      {/* Author info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-olive-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-olive-700">
                            {post.author_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">{post.author_name}</span>
                          <span className="text-sm text-slate-500">{formatDate(post.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Row 2 */}
              {filteredPosts.length > 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {filteredPosts.slice(3, 6).map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col bg-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer rounded-none"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className="w-full h-60 bg-gradient-to-br from-olive-100 to-beige-100 flex items-center justify-center">
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-6xl">📊</span>
                        )}
                      </div>
                      <div className="flex flex-col justify-between p-6 gap-8 flex-grow">
                        <div className="flex flex-col gap-3">
                          {post.category && (
                            <span className="text-sm font-semibold text-olive-700">
                              {post.category.name}
                            </span>
                          )}
                          <div className="flex flex-col gap-3">
                            <h2 className="text-2xl font-semibold text-slate-900 leading-8 line-clamp-2">
                              {post.title}
                            </h2>
                            <p className="text-base text-slate-500 leading-6 line-clamp-3">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-olive-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-olive-700">
                              {post.author_name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-900">{post.author_name}</span>
                            <span className="text-sm text-slate-500">{formatDate(post.published_at)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {filteredPosts.length > 6 && (
                <div className="flex justify-center">
                  <button className="flex items-center justify-center gap-2 px-5 py-3 bg-[#F5F1E8] border border-olive-600 rounded-lg shadow-sm hover:bg-beige-100 transition">
                    <ArrowRight className="w-5 h-5 text-olive-700 rotate-90" />
                    <span className="text-base font-medium text-olive-700">Load more</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-olive-600 to-olive-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Price Your Project?
          </h2>
          <p className="text-xl text-beige-100 mb-8">
            Stop guessing and get AI-powered pricing recommendations in minutes.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-olive-600 rounded-xl hover:bg-beige-50 transition font-semibold text-lg shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

