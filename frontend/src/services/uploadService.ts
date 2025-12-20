import api from '@/lib/api';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UploadResult {
  url: string;
  type: string;
  name: string;
  size: number;
}

/**
 * Upload a file in chunks to the backend
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  
  console.log(`Starting chunked upload: ${file.name}, ${totalChunks} chunks`);

  // Upload each chunk
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('fileId', fileId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', file.name);
    formData.append('mimeType', file.type);

    await api.post('/assets/upload-chunk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Report progress
    if (onProgress) {
      const loaded = end;
      onProgress({
        loaded,
        total: file.size,
        percentage: Math.round((loaded / file.size) * 100),
      });
    }
  }

  // Complete the upload and get the final URL
  const response = await api.post('/assets/complete-upload', {
    fileId,
    fileName: file.name,
  });

  return {
    url: response.data.url,
    type: file.type,
    name: file.name,
    size: file.size,
  };
};

export const uploadService = {
  uploadFile,
};

