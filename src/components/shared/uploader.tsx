"use client";

import Uppy from '@uppy/core';
import Transloadit from '@uppy/transloadit';
import { useUppy } from '@uppy/react';
import { useEffect } from 'react';

interface UploaderProps {
  templateId: string;
  onSuccess: (url: string) => void;
  allowedFileTypes?: string[];
}

export function useTransloaditUploader({ templateId, onSuccess, allowedFileTypes }: UploaderProps) {
  const uppy = useUppy(() => {
    return new Uppy({
      id: `${templateId}-uploader`,
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: allowedFileTypes || ['image/*']
      }
    }).use(Transloadit, {
      waitForResults: true,
      params: {
        auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY },
        template_id: templateId,
      },
    });
  });

  useEffect(() => {
    uppy.on('transloadit:result', (stepName, result) => {
      if (result.ssl_url) {
        onSuccess(result.ssl_url);
      }
    });

    return () => uppy.close();
  }, [uppy, onSuccess]);

  return uppy;
}
