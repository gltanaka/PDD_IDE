import React, { useState } from 'react';

interface ChangeModalProps {
  onClose: () => void;
  onSubmit: (changeRequest: string) => void;
}

const ChangeModal: React.FC<ChangeModalProps> = ({ onClose, onSubmit }) => {
  const [changeRequest, setChangeRequest] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (changeRequest.trim()) {
      onSubmit(changeRequest.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-modal-title"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="change-modal-title" className="text-lg font-semibold text-white">
            Propose a Change
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="p-6 space-y-4">
            <p className="text-sm text-gray-300">
              Describe the change you want to make in plain English. The AI will analyze your request and suggest which prompt file is the best one to modify.
            </p>
            <div>
              <label htmlFor="change-request" className="sr-only">
                Change Request
              </label>
              <textarea
                id="change-request"
                name="change-request"
                rows={5}
                value={changeRequest}
                onChange={e => setChangeRequest(e.target.value)}
                placeholder="e.g., Add a loading spinner to the button component when it's in a submitting state."
                className="block w-full rounded-md border-0 bg-white/5 py-2 px-3 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 transition-shadow duration-200"
                required
              />
            </div>
          </main>
          <footer className="px-6 py-4 bg-gray-800/50 border-t border-gray-700 flex justify-end space-x-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors disabled:opacity-50"
              disabled={!changeRequest.trim()}
            >
              Submit
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ChangeModal;