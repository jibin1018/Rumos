import { api } from './api';

// Get all board categories
export const getBoardCategories = async () => {
  try {
    const response = await api.get('/board/categories');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get board categories');
  }
};

// Get all posts (with optional category filter)
export const getAllPosts = async (categoryId = null) => {
  try {
    const url = categoryId ? `/board/posts?category=${categoryId}` : '/board/posts';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get posts');
  }
};

// Get a single post by ID
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/board/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get post');
  }
};

// Create a new post
export const createPost = async (postData) => {
  try {
    const response = await api.post('/board/posts', postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create post');
  }
};

// Update an existing post
export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/board/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update post');
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/board/posts/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete post');
  }
};

// Get comments for a post
export const getComments = async (postId) => {
  try {
    const response = await api.get(`/board/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get comments');
  }
};

// Create a comment
export const createComment = async (postId, content) => {
  try {
    const response = await api.post(`/board/posts/${postId}/comments`, { content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create comment');
  }
};

// Update a comment
export const updateComment = async (commentId, content) => {
  try {
    const response = await api.put(`/board/comments/${commentId}`, { content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update comment');
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/board/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};
