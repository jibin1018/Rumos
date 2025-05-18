// frontend/src/components/properties/ContactModal.js
import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const ContactModal = ({ isOpen, onClose, onSubmit, property }) => {
  const { t } = useTranslation('properties');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await onSubmit(message);
      setMessage('');
    } catch (error) {
      console.error('Error submitting contact request:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={onClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title
                    as="h3"
                    className="text-lg leading-6 font-medium text-gray-900"
                  >
                    {t('contactRequest.title')}
                  </Dialog.Title>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      {t('contactRequest.description')}
                    </p>
                    
                    {property && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-900">
                          {property.address}
                        </h4>
                        <div className="mt-2 flex justify-between text-sm text-gray-500">
                          <span>{property.city}, {property.district || ''}</span>
                          <span>
                            {property.deposit && property.monthly_rent
                              ? `${Intl.NumberFormat('ko-KR', {
                                  style: 'currency',
                                  currency: 'KRW',
                                  maximumFractionDigits: 0,
                                }).format(property.deposit)} / ${Intl.NumberFormat('ko-KR', {
                                  style: 'currency',
                                  currency: 'KRW',
                                  maximumFractionDigits: 0,
                                }).format(property.monthly_rent)}`
                              : ''}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                          {t('contactRequest.message')}
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder={t('contactRequest.messagePlaceholder')}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading || !message.trim()}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              {t('contactRequest.sending')}
                            </>
                          ) : (
                            t('contactRequest.send')
                          )}
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                          onClick={onClose}
                        >
                          {t('common.cancel', { ns: 'common' })}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ContactModal;
