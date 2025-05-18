import React from 'react';
import { useTranslation } from 'react-i18next';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const { t } = useTranslation('board');

  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">{t('board.categories')}</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {t('board.allCategories')}
        </button>
        
        {categories.map((category) => (
          <button
            key={category.category_id}
            onClick={() => onSelectCategory(category.category_id)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === category.category_id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t(`categories.${category.name}`, { defaultValue: category.name })}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
