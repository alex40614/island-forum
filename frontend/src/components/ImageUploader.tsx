import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../services/api';
import './ImageUploader.css';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 9,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (images.length + files.length > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    setError('');
    setUploading(true);

    const newImages = [...images];

    try {
      for (const file of files) {
        // 验证文件大小
        if (file.size > 5 * 1024 * 1024) {
          setError(`文件 ${file.name} 超过 5MB`);
          continue;
        }

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
          setError(`文件 ${file.name} 不是图片`);
          continue;
        }

        // 上传图片
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        newImages.push(response.data.url);
      }

      onChange(newImages);
    } catch (err: any) {
      setError(err.response?.data?.detail || '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="image-uploader">
      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="file-input"
        />
        <button
          type="button"
          onClick={triggerFileInput}
          className="upload-btn"
          disabled={uploading}
        >
          <Upload size={20} />
          <span>{uploading ? '上传中...' : '上传图片'}</span>
        </button>
        <span className="hint">支持 JPG、PNG、GIF，最大 5MB</span>
      </div>

      {images.length > 0 && (
        <div className="image-preview-list">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <img src={image} alt={`preview ${index + 1}`} />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="remove-btn"
                title="删除"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
