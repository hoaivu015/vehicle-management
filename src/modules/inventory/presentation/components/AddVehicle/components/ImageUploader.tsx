import React, { useId } from 'react';
import { Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';
import { optimizeCloudinaryUrl } from '@/src/shared/utils/cloudinary';
import { Skeleton } from '@/src/shared/design-system/Skeleton';

interface ImageUploaderProps {
  isUploading: boolean;
  imageUrl: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onUrlChange: (url: string) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  isUploading, 
  imageUrl, 
  onUpload, 
  onRemove, 
  onUrlChange: _onUrlChange,
  className
}) => {
  const uploadId = useId();
  
  return (
    <div className={cn("space-y-3 w-full", className)}>
      <div className="flex items-center justify-between px-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-kraft-ink/40">Hình ảnh</label>
        {imageUrl && (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="button" 
            onClick={onRemove}
            className="text-[10px] font-black text-expense uppercase tracking-widest hover:opacity-80 transition-all"
          >
            Gỡ bỏ
          </motion.button>
        )}
      </div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative group w-full aspect-[4/3] max-w-[320px] mx-auto"
      >
        <input
          type="file"
          id={uploadId}
          className="sr-only"
          accept="image/*"
          onChange={onUpload}
          disabled={isUploading}
        />
        <label
          htmlFor={uploadId}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full rounded-t2 border-2 border-dashed transition-all cursor-pointer overflow-hidden relative",
            isUploading ? "border-kraft-accent/20 bg-kraft-accent/5" : "border-hairline-soft hover:border-kraft-accent/40 hover:bg-kraft-accent/5",
            imageUrl && "border-none shadow-kraft-deep"
          )}
        >
          {isUploading && (
            <Skeleton className="w-full h-full rounded-3xl absolute inset-0 z-10" />
          )}

          {imageUrl ? (
            <>
              <img src={optimizeCloudinaryUrl(imageUrl, { width: 400 })} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Camera size={24} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest mt-2">Thay đổi ảnh</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-kraft-accent/5 flex items-center justify-center mb-4 border border-kraft-accent/10">
                <Camera size={28} strokeWidth={2.5} className="text-kraft-accent/40" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-kraft-ink/30 text-center px-6 leading-relaxed">
                Tải ảnh xe lên
              </span>
              <p className="text-[9px] font-bold text-kraft-ink/20 mt-2 uppercase tracking-widest">Hỗ trợ JPG, PNG, WEBP</p>
            </>
          )}
        </label>
      </motion.div>
    </div>
  );
};
