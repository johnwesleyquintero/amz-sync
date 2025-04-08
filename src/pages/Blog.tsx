// src/pages/Blog.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
// Import any components needed for blog post previews, e.g., Card, Badge
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';

const Blog = () => {
  // Placeholder for actual blog post data - replace with fetched data later
  const blogPosts = [
    // {
    //   id: '1',
    //   title: 'Understanding ACoS: A Guide for Amazon Sellers',
    //   date: 'July 26, 2024',
    //   excerpt: 'Dive deep into Advertising Cost of Sales (ACoS) and learn how to optimize your PPC campaigns effectively on Amazon.',
    //   tags: ['PPC', 'Advertising', 'Optimization'],
    //   slug: '/blog/understanding-acos', // Example link
    // },
    // {
    //   id: '2',
    //   title: 'Top 5 Keyword Research Strategies for 2024',
    //   date: 'July 20, 2024',
    //   excerpt: 'Stay ahead of the competition with these proven keyword research techniques tailored for Amazon sellers.',
    //   tags: ['Keywords', 'SEO', 'Strategy'],
    //   slug: '/blog/keyword-research-strategies', // Example link
    // },
  ];

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            Latest updates, tips, and industry insights for Amazon sellers
          </p>
        </div>

        {/* Content Area - Blog Post Listing */}
        <div className="space-y-6">
          {blogPosts.length > 0 ? (
            blogPosts.map(post => (
              // Example using Card component for each post preview (uncomment imports if using)
              /*
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <a href={post.slug} className="hover:underline">
                    <CardTitle className="text-xl text-primary">{post.title}</CardTitle>
                  </a>
                  <CardDescription className="text-sm">
                    Published on {post.date}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                  <a href={post.slug} className="text-sm text-primary hover:underline mt-4 inline-block">
                    Read More &rarr;
                  </a>
                </CardContent>
              </Card>
              */
              // Placeholder rendering until Card structure is used
              <section
                key={post.id}
                className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-3">Published on {post.date}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{post.excerpt}</p>
                {/* Add tags and read more link here if needed */}
              </section>
            ))
          ) : (
            // Placeholder Section if no posts are available yet
            <section className="bg-white p-6 rounded-lg shadow-md dark:bg-gray-800 dark:border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Coming Soon
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                We're working on bringing you valuable content. Check back soon for our latest
                articles, tips, and industry news related to selling on Amazon!
              </p>
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
