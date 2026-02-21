export const CONFIDENCE_THRESHOLD = 0.7;

const HARD_NON_ID_KEYWORDS = [
  'website',
  'screen',
  'monitor',
  'television',
];

const SOFT_NON_ID_KEYWORDS = [
  'book jacket',
  'comic book',
  'menu',
  'packet',
  'envelope',
  'binder',
  'notebook',
];

function hasKeywordMatch(labelText = '', keywords = []) {
  const normalized = labelText.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function normalizePredictions(predictionOrPredictions) {
  if (Array.isArray(predictionOrPredictions)) {
    return predictionOrPredictions;
  }

  return predictionOrPredictions ? [predictionOrPredictions] : [];
}

export function getCnicDecision(predictionOrPredictions, threshold = CONFIDENCE_THRESHOLD) {
  // This module performs visual classification only for FYP demonstration.
  // Decision rule:
  // 1) confidence must be >= threshold
  // 2) clearly non-ID labels are rejected
  // 3) ambiguous document-like labels are rejected only at very high confidence
  //    to reduce false negatives for real CNIC images.
  // 4) we evaluate multiple predictions (when available) so front/back CNIC photos
  //    are not rejected only due to one imperfect top label.
  const predictions = normalizePredictions(predictionOrPredictions);

  if (predictions.length === 0) {
    return {
      topLabel: 'No prediction',
      confidence: 0,
      finalDecision: 'Not CNIC-like',
    };
  }

  const topPrediction = predictions[0];
  const topLabel = topPrediction.className?.split(',')[0]?.trim() || 'Unknown';
  const confidence = topPrediction.probability || 0;

  const acceptablePrediction = predictions.find((item) => {
    const itemConfidence = item?.probability || 0;
    const itemLabel = item?.className || '';

    const belowThreshold = itemConfidence < threshold;
    const hardNonIdMatch = hasKeywordMatch(itemLabel, HARD_NON_ID_KEYWORDS);
    const softNonIdMatch = hasKeywordMatch(itemLabel, SOFT_NON_ID_KEYWORDS);

    // Soft labels are treated as ambiguous, not absolute rejection.
    // We only reject soft labels when confidence is extremely high.
    return !belowThreshold && !hardNonIdMatch && !(softNonIdMatch && itemConfidence >= 0.97);
  });

  // Aggregate confidence across top predictions that are not hard non-ID.
  // This helps with real CNIC photos where MobileNet may split probability
  // across multiple generic classes instead of one strong class.
  const aggregateCnicLikeConfidence = predictions.reduce((sum, item) => {
    const itemLabel = item?.className || '';
    const itemConfidence = item?.probability || 0;
    const hardNonIdMatch = hasKeywordMatch(itemLabel, HARD_NON_ID_KEYWORDS);

    if (hardNonIdMatch) {
      return sum;
    }

    return sum + itemConfidence;
  }, 0);

  const topIsHardNonId = hasKeywordMatch(topPrediction.className || topLabel, HARD_NON_ID_KEYWORDS);

  const aggregatePass = aggregateCnicLikeConfidence >= threshold && !topIsHardNonId;

  const isCnicLike = Boolean(acceptablePrediction) || aggregatePass;

  return {
    topLabel,
    confidence,
    finalDecision: isCnicLike ? 'CNIC-like' : 'Not CNIC-like',
  };
}
