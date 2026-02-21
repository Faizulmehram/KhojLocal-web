import React, { useMemo, useRef, useState } from 'react';
import useMobileNet from '../hooks/useMobileNet';
import { CONFIDENCE_THRESHOLD, getCnicDecision } from '../utils/cnicRules';

export default function CNICClassifier() {
  const { isLoading, error, classifyImage } = useMobileNet();
  const imageRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [result, setResult] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [fileError, setFileError] = useState('');

  const confidenceThresholdPercent = useMemo(() => Math.round(CONFIDENCE_THRESHOLD * 100), []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setResult(null);
    setFileError('');

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setSelectedFile(null);
      setPreviewUrl('');
      setFileError('Please upload a JPG or PNG image only.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const localUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(localUrl);
  };

  const handleClassify = async () => {
    if (!imageRef.current || !selectedFile) {
      setFileError('Please upload a CNIC image first.');
      return;
    }

    setIsClassifying(true);
    setFileError('');

    try {
      const predictions = await classifyImage(imageRef.current);
      const topPrediction = predictions?.[0];
      const decision = getCnicDecision(topPrediction, CONFIDENCE_THRESHOLD);
      setResult(decision);
    } catch (classificationError) {
      setFileError('Classification failed. Please try another image.');
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white border border-gray-200 rounded-2xl">
      <h2 className="text-xl font-semibold mb-2">CNIC Image Classification (Demo)</h2>
      <p className="text-sm text-gray-600 mb-4">
        This feature performs visual classification only and does not verify identity or document authenticity.
      </p>

      {/* Client-side ML keeps inference in the browser for quick demo feedback and no paid API usage. */}
      <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="cnic-image-upload">
        Upload CNIC-like Image (JPG/PNG)
      </label>
      <input
        id="cnic-image-upload"
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="w-full border border-gray-300 rounded-lg p-2 mb-4"
      />

      {previewUrl && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
          <img
            ref={imageRef}
            src={previewUrl}
            alt="Preview for CNIC classification"
            className="w-full max-h-80 object-contain border border-gray-200 rounded-lg"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleClassify}
        disabled={isLoading || isClassifying || !previewUrl}
        className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isClassifying ? 'Classifying...' : 'Classify Image'}
      </button>

      {isLoading && <p className="text-sm text-gray-500 mt-3">Loading MobileNet model...</p>}
      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {fileError && <p className="text-sm text-red-600 mt-3">{fileError}</p>}

      {result && (
        <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-700"><span className="font-semibold">Top Prediction:</span> {result.topLabel}</p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-semibold">Confidence:</span> {(result.confidence * 100).toFixed(2)}%
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <span className="font-semibold">Threshold:</span> {confidenceThresholdPercent}%
          </p>
          <p className="text-base font-semibold mt-3 text-indigo-700">Final Decision: {result.finalDecision}</p>
        </div>
      )}
    </div>
  );
}
