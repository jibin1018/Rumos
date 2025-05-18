// frontend/src/components/common/LanguageSwitcher.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageSwitcher = ({ className }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md bg-opacity-90 hover:bg-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <GlobeAltIcon
            className="w-5 h-5 mr-2 -ml-1 text-white"
            aria-hidden="true"
          />
          <span>{currentLanguage.flag} {currentLanguage.name}</span>
          <ChevronDownIcon
            className="w-5 h-5 ml-2 -mr-1 text-white"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          static
          className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="px-1 py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }) => (
                  <button
                    onClick={() => changeLanguage(language.code)}
                    className={`${
                      active || i18n.language === language.code
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                  >
                    <span className="mr-2">{language.flag}</span>
                    {language.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguageSwitcher;
