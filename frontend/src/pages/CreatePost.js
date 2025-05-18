import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getBoardCategories, createPost, getPostById, updatePost } from '../services/boardService';
import { useAuth } from '../contexts/AuthContext';
import useForm from '../hooks/useForm';
import { validatePostForm } from '../utils/validators';

const CreatePost = () => {
  const { id } = useParams(); // If editing, id will be defined
  const history = useHistory();
  const { t } = useTranslation('board');
  const { currentUser, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(!!id);

  const initialValues = {
    title: '',
    content: '',
    categoryId: ''
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        await updatePost(id, {
          title: values.title,
          content: values.content,
          categoryId: values.categoryId || null
        });
      } else {
        await createPost({
          title: values.title,
          content: values.content,
          categoryId: values.categoryId || null
        });
      }
      history.push('/board');
    } catch (error) {
      setServerError(error.message || 'Failed to save post');
      return false;
    }
  };

  const { 
    values, 
    errors, 
    handleChange, 
    handleBlur, 
    handleSubmit: submitForm,
    setValues
  } = useForm(initialValues, validatePostForm, handleSubmit);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesData = await getBoardCategories();
        setCategories(categoriesData);
        
        // If editing, fetch the post details
        if (isEditMode) {
          const { post } = await getPostById(id);
          
          // Check if current user is the author or admin
          if (!currentUser || (currentUser.user_id !== post.user_id && currentUser.role !== 'admin')) {
            history.push('/board');
            return;
          }
          
          setValues({
            title: post.title,
            content: post.content,
            categoryId: post.category_id?.toString() || ''
          });
        }
      } catch (error) {
        setServerError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, currentUser, history, setValues]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    history.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? t('post.edit') : t('board.createPost')}
        </h1>
        
        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {serverError}
          </div>
        )}
        
        <form onSubmit={submitForm} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.title')} *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-md ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.category')}
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={values.categoryId}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 border rounded-md ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">{t('board.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {t(`categories.${category.name}`, { defaultValue: category.name })}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              {t('post.content')} *
            </label>
            <textarea
              id="content"
              name="content"
              value={values.content}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="10"
              className={`w-full p-3 border rounded-md ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            ></textarea>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link
              to="/board"
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              {t('post.cancel')}
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditMode ? t('post.edit') : t('post.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
