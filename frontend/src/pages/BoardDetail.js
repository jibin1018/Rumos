import React, { useState, useEffect } from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  getPostById, 
  createComment, 
  deletePost, 
  deleteComment 
} from '../services/boardService';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import CommentForm from '../components/board/CommentForm';

const BoardDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation('board');
  const history = useHistory();
  const { currentUser } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [commentDeleteId, setCommentDeleteId] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await getPostById(id);
        setPost(data.post);
        setComments(data.comments || []);
      } catch (err) {
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (content) => {
    try {
      const newComment = await createComment(post.post_id, content);
      setComments([...comments, newComment]);
      return true;
    } catch (err) {
      throw new Error(err.message || 'Failed to submit comment');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post.post_id);
      history.push('/board');
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(comment => comment.comment_id !== commentId));
      setCommentDeleteId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Post not found'}
        </div>
        <Link
          to="/board"
          className="inline-block px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          {t('post.goToList')}
        </Link>
      </div>
    );
  }

  const canEditOrDelete = currentUser && (
    currentUser.user_id === post.user_id || currentUser.role === 'admin'
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4">
        <Link
          to="/board"
          className="inline-flex items-center text-blue-600 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t('post.goToList')}
        </Link>
      </div>

      {/* Post Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{post.username}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(post.created_at)}</span>
              {post.created_at !== post.updated_at && (
                <span className="ml-2 text-xs italic">
                  ({t('post.editedAt')})
                </span>
              )}
              <span className="mx-2">•</span>
              <span>{t('post.views')}: {post.views}</span>
            </div>
          </div>

          {canEditOrDelete && (
            <div className="flex space-x-2">
              <Link
                to={`/board/edit/${post.post_id}`}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
              >
                {t('post.edit')}
              </Link>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
              >
                {t('post.delete')}
              </button>
            </div>
          )}
        </div>

        {post.category_name && (
          <div className="mb-4">
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
              {t(`categories.${post.category_name}`, { defaultValue: post.category_name })}
            </span>
          </div>
        )}

        {/* Post Content */}
        <div className="prose max-w-none">
          <p>{post.content}</p>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-4">{t('post.deleteConfirm')}</h3>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('post.comments')} ({comments.length})
        </h2>

        {comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div
                key={comment.comment_id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-medium">{comment.username}</span>
                      <span className="mx-2 text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.created_at !== comment.updated_at && (
                        <span className="ml-2 text-xs italic text-gray-500">
                          ({t('post.editedAt')})
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>

                  {currentUser && (currentUser.user_id === comment.user_id || currentUser.role === 'admin') && (
                    <button
                      onClick={() => setCommentDeleteId(comment.comment_id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      {t('post.delete')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">댓글이 없습니다.</p>
        )}

        {/* Comment Delete Confirmation */}
        {commentDeleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
              <h3 className="text-lg font-bold mb-4">{t('post.deleteCommentConfirm')}</h3>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCommentDeleteId(null)}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCommentDelete(commentDeleteId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comment Form */}
        <CommentForm postId={post.post_id} onCommentSubmit={handleCommentSubmit} />
      </div>
    </div>
  );
};

export default BoardDetail;
