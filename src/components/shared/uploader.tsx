import { useMemo, useEffect } from 'react';
import Uppy from '@uppy/core';
import Transloadit from '@uppy/transloadit';

interface UploaderProps {
  templateId: string;
  onSuccess: (url: string) => void;
  allowedFileTypes?: string[];
}

export function useTransloaditUploader({ templateId, onSuccess, allowedFileTypes }: UploaderProps) {
  const uppy = useMemo(() => {
    return new Uppy({
      id: `${templateId}-uploader`,
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
        allowedFileTypes: allowedFileTypes || ['image/*']
      }
    }).use(Transloadit, {
      assemblyOptions: {
        params: {
          auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "" },
          template_id: templateId,
        },
      },
    });
  }, [templateId, allowedFileTypes]);

  useEffect(() => {
    (uppy as any).on('transloadit:result', (stepName: string, result: any) => {
      if (result.ssl_url) {
        onSuccess(result.ssl_url);
      }
    });

    return () => uppy.destroy();
  }, [uppy, onSuccess]);

  return uppy;
}
