// src/components/ErrorDisplay.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry, title = "Error" }) => {
  return (
    <div className="alert alert-danger">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span className="font-semibold">{title}</span>
      </div>
      <p className="mt-1">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 btn btn-primary text-sm"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;