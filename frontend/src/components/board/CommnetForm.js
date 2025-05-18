import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const CommentForm = ({ postId, onCommentSubmit }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('board');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError(t('post.emptyComment'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onCommentSubmit(content);
      setContent('');
    } catch (err) {
      setError(err.message || 'Error submitting comment');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-100 p-4 rounded-md text-center text-gray-600">
        로그인 후 댓글을 작성할 수 있습니다.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-medium mb-2">{t('post.writeComment')}</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="댓글을 입력하세요..."
        ></textarea>
        
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? '처리 중...' : t('post.submitComment')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
