import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Trash2, X, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { stockApi } from '../services/stockApi';

const PDFUploadModal = ({ isOpen, onClose, onDocumentSelected }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await stockApi.listDocuments();
      setDocuments(docs || []);
    } catch (e) {
      console.error("Failed loading documents", e);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError('');
    setSuccess('');
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Only PDF files (.pdf) are allowed.');
        return;
      }
      setFile(selected);
    }
  };

  const handleUploadAndIndex = async () => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    setSuccess('');
    setProgress(10);
    setStatusText('Uploading PDF annual report to backend...');

    try {
      // 1. Upload PDF
      const uploadRes = await stockApi.uploadPdf(file, (p) => setProgress(Math.min(p, 80)));
      setStatusText('Extracting PyMuPDF page text & indexing vectors in ChromaDB...');
      setProgress(90);

      // 2. Index into ChromaDB
      await stockApi.indexDocument(uploadRes.id);
      setProgress(100);
      setSuccess(`Report '${uploadRes.original_filename}' successfully indexed into ChromaDB!`);
      setFile(null);
      fetchDocuments();

      if (onDocumentSelected) {
        onDocumentSelected(uploadRes);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to upload and index PDF document.';
      setError(typeof msg === 'string' ? msg : 'PDF Processing error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await stockApi.deleteDocument(docId);
      fetchDocuments();
    } catch (e) {
      setError('Failed to delete document');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1E293B] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Annual Report PDF & Vector Indexing</h2>
              <p className="text-xs text-slate-400">Upload 10-K financial reports to index into ChromaDB vector database for RAG AI QA</p>
            </div>
          </div>

          {/* Alert Banners */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="border-2 border-dashed border-slate-700/80 hover:border-blue-500/80 p-6 rounded-2xl bg-slate-900/50 text-center space-y-3 transition-colors">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              id="pdf-upload-input"
              className="hidden"
            />
            <label htmlFor="pdf-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-200">
                {file ? file.name : 'Click to select Financial Annual Report PDF'}
              </p>
              <p className="text-xs text-slate-400">PDF files up to 50MB (e.g., Tesla_10K_2024.pdf)</p>
            </label>

            {file && (
              <button
                onClick={handleUploadAndIndex}
                disabled={isUploading}
                className="mt-3 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto shadow-lg shadow-blue-600/30"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing & Indexing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Upload & Index to ChromaDB
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* List of Indexed Documents */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Indexed Knowledge Base Documents ({documents.length})
            </h3>

            {isLoadingDocs ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading indexed reports...</p>
            ) : documents.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-200 line-clamp-1">{doc.original_filename}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          ID: {doc.id} • {doc.total_pages} Pages • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete document & vectors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4 italic">No documents indexed yet. Upload an annual report PDF above.</p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PDFUploadModal;
