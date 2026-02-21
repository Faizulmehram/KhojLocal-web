import { useCallback, useEffect, useState } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

let sharedModel = null;
let sharedModelPromise = null;

async function loadMobileNetModel() {
  if (sharedModel) {
    return sharedModel;
  }

  if (!sharedModelPromise) {
    // MobileNet is a lightweight CNN pre-trained on ImageNet.
    // We use its pre-learned visual features instead of training a model from scratch.
    sharedModelPromise = mobilenet.load().then((model) => {
      sharedModel = model;
      return model;
    }).catch((error) => {
      sharedModelPromise = null;
      throw error;
    });
  }

  return sharedModelPromise;
}

export default function useMobileNet() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const start = async () => {
      try {
        await loadMobileNetModel();
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (modelError) {
        if (isMounted) {
          setError('Failed to load MobileNet model. Please refresh and try again.');
          setIsLoading(false);
        }
      }
    };

    start();

    return () => {
      isMounted = false;
    };
  }, []);

  const classifyImage = useCallback(async (imgElement) => {
    if (!imgElement) {
      throw new Error('Image element is required for classification.');
    }

    const model = await loadMobileNetModel();

    // This follows the transfer-learning idea in practice:
    // we reuse a pre-trained model's visual understanding for a new task.
    return model.classify(imgElement);
  }, []);

  return {
    isLoading,
    error,
    classifyImage,
  };
}
