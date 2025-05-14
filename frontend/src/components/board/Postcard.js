import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../utils/formatters';

const PostCard = ({ post }) => {
  const { t } = useTranslation('board');
  
  return (
    <div className="border border-gray-200 rounded-md p-4 mb-3 hover:shadow-md transition-shadow">
      <Link to={`/board/${post.post_id}`} className="block">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-lg mb-1 text-blue-800">{post.title}</h3>
            <div className="flex items-center text-sm text-gray-500">
              <span>{post.username}</span>
              <span className="mx-2">•</span>
              <span>{formatDate(post.created_at)}</span>
              {post.created_at !== post.updated_at && (
                <span className="ml-2 text-xs italic">
                  ({t('post.editedAt')})
                </span>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center">
            <span className="mr-3">
              {t('post.views')}: {post.views}
            </span>
            <span>
              {t('post.comments')}: {post.comment_count || 0}
            </span>
          </div>
        </div>
        
        {post.category_name && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full">
              {t(`categories.${post.category_name}`, { defaultValue: post.category_name })}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
};

export default PostCard;