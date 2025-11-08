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
      <section className="bg-gradient-to-r from-olive-600 to-olive-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pricing Guides & Resources
            </h1>
            <p className="text-xl text-beige-100 mb-8">
              Expert advice on how to price your products, services, and freelance work. 
              Learn pricing strategies that actually work.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-beige-200 focus:border-olive-500 focus:ring-2 focus:ring-olive-500 focus:outline-none text-slate-800"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="bg-white border-b border-beige-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-olive-600 text-white'
                  : 'bg-beige-100 text-slate-700 hover:bg-beige-200'
              }`}
            >
              All Articles
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === category.slug
                    ? 'bg-olive-600 text-white'
                    : 'bg-beige-100 text-slate-700 hover:bg-beige-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-olive-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-slate-600 mb-4">No articles found</p>
              <p className="text-slate-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-beige-200 overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  {/* Featured Image */}
                  {post.featured_image_url ? (
                    <div className="aspect-video bg-gradient-to-br from-olive-100 to-beige-100 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-olive-100 to-beige-100 flex items-center justify-center">
                      <span className="text-4xl">📊</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Category Badge */}
                    {post.category && (
                      <span className="inline-block px-3 py-1 bg-olive-100 text-olive-700 text-xs font-semibold rounded-full mb-3">
                        {post.category.name}
                      </span>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-olive-600 transition line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-slate-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.reading_time_minutes} min read</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-olive-600 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </article>
              ))}
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

