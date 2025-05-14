import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllPosts, getBoardCategories } from '../services/boardService';
import PostCard from '../components/board/PostCard';
import CategoryFilter from '../components/board/CategoryFilter';

const Board = () => {
  const { t } = useTranslation('board');
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postsData, categoriesData] = await Promise.all([
          getAllPosts(),
          getBoardCategories()
        ]);
        
        setPosts(postsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || 'Failed to load board data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter posts based on category and search term
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory ? post.category_id === selectedCategory : true;
    const matchesSearch = searchTerm
      ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('board.title')}</h1>
        <Link
          to="/board/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('board.createPost')}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-4">
            <input
              type="text"
              placeholder={t('board.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p>{t('board.loading')}</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div>
              {filteredPosts.map((post) => (
                <PostCard key={post.post_id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-md p-8 text-center">
              <p className="text-gray-600">{t('board.noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;