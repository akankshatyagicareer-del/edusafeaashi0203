// src/components/FileViewer.jsx
import React from 'react';

const FileViewer = ({ fileUrl, title }) => {
  if (!fileUrl) {
    return <div className="text-gray-400 text-sm">No preview available</div>;
  }

  const normalized = String(fileUrl).trim();
  const ext = normalized.split('?')[0].split('.').pop().toLowerCase();

  // PDF
  if (ext === 'pdf') {
    return (
      <iframe
        src={normalized}
        title={title || 'PDF Viewer'}
        className="w-full h-64 border rounded"
      />
    );
  }

  // Videos
  if (['mp4', 'webm', 'ogg'].includes(ext)) {
    return (
      <video controls className="w-full h-64 rounded">
        <source src={normalized} />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Images
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
    return (
      <img
        src={normalized}
        alt={title || 'Resource'}
        className="w-full h-64 object-contain rounded"
      />
    );
  }

  // Office files → Microsoft Office Viewer
  if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) {
    const officeViewer = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
      normalized
    )}`;
    return (
      <iframe
        src={officeViewer}
        title={title || 'Office Viewer'}
        className="w-full h-64 border rounded"
      />
    );
  }

  // Fallback
  return (
    <div className="text-sm">
      <p className="mb-2 text-gray-500">Preview not available. Open in new tab:</p>
      <a
        href={normalized}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        Open File
      </a>
    </div>
  );
};

export default FileViewer;
