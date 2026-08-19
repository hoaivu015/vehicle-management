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
    <div className={cn("space-y-2 w-full flex flex-col", className)}>
      {imageUrl && (
        <div className="flex items-center justify-end px-1">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            type="button" 
            onClick={onRemove}
            className="text-[10px] font-black text-expense uppercase tracking-widest hover:opacity-80 transition-all px-3 py-1 bg-expense/10 rounded-full"
          >
            Gỡ bỏ
          </motion.button>
        </div>
      )}

      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative group w-full aspect-[16/9] rounded-[20px] overflow-hidden"
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
            "flex flex-col items-center justify-center w-full h-full rounded-[20px] border-2 border-dashed transition-all cursor-pointer overflow-hidden relative",
            isUploading ? "border-kraft-accent/30 bg-kraft-accent/5" : "border-hairline-soft hover:border-kraft-accent/50 hover:bg-kraft-accent/[0.03] bg-white",
            imageUrl && "border-none shadow-kraft-deep"
          )}
        >
          {isUploading && (
            <Skeleton className="w-full h-full rounded-[20px] absolute inset-0 z-10" />
          )}

          {imageUrl ? (
            <>
              <img src={optimizeCloudinaryUrl(imageUrl, { width: 600 })} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-1.5">
                  <Camera size={18} strokeWidth={2.5} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-white/20 backdrop-blur-md rounded-full">Thay đổi ảnh</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-11 h-11 rounded-full bg-kraft-accent/5 flex items-center justify-center mb-1.5 border border-kraft-accent/10 group-hover:scale-110 transition-transform">
                <Camera size={20} strokeWidth={2.2} className="text-kraft-accent" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-kraft-ink/60 text-center px-4 leading-tight">
                Tải ảnh xe lên
              </span>
              <p className="text-[8px] font-bold text-sub-label mt-0.5 uppercase tracking-widest">JPG, PNG, WEBP</p>
            </>
          )}
        </label>
      </motion.div>
    </div>
  );
};
