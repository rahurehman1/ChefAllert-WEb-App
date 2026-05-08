import { useState, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Upload, Camera, X, Loader2 } from 'lucide-react';

interface ProfilePictureUploadProps {
  currentPicture: string | null;
  onUploadSuccess: (newPictureUrl: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePictureUpload({ 
  currentPicture, 
  onUploadSuccess, 
  size = 'lg',
  className = ''
}: ProfilePictureUploadProps) {
  const { user, updateUser, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: { container: 'w-24 h-24', icon: 'w-6 h-6', camera: 'w-8 h-8', button: 'p-1.5', remove: 'p-1' },
    md: { container: 'w-32 h-32', icon: 'w-8 h-8', camera: 'w-12 h-12', button: 'p-2', remove: 'p-1.5' },
    lg: { container: 'w-40 h-40', icon: 'w-10 h-10', camera: 'w-16 h-16', button: 'p-3', remove: 'p-2' }
  };

  const currentSize = sizeClasses[size];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setDebugInfo({
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_lastModified: file.lastModified
    });

    // ✅ File validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type: ${file.type}. Allowed: JPG, PNG, GIF, WEBP`);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Max: 5MB`);
      return;
    }

    // ✅ Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // ✅ Upload to server
    uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      console.log('📤 Uploading file:', file.name, file.size, file.type);
      
      const response = await api.post('/api/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📥 Upload response:', response.data);
      setDebugInfo(response.data);

      if (response.data.success) {
        const newPictureUrl = response.data.profile_picture_url;
        console.log('✅ New picture URL:', newPictureUrl);
        
        // ✅ CRITICAL: Update auth context with full user object
        if (response.data.user && updateUser) {
          updateUser(response.data.user);
        } else if (user) {
          // Fallback: Update just the profile picture
          updateUser({
            ...user,
            profile_picture_url: newPictureUrl
          });
        }
        
        // Also call the parent callback
        onUploadSuccess(newPictureUrl);
        setPreview(null);
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Test the image URL
        testImageUrl(newPictureUrl);
        
        // Force refresh user data from server
        if (refreshUser) {
          setTimeout(() => refreshUser(), 500);
        }
      } else {
        setError(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload profile picture');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const testImageUrl = (url: string) => {
    console.log('🧪 Testing image URL:', url);
    
    // Create an image element to test if it loads
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image loads successfully:', url);
      console.log('📐 Image dimensions:', img.width, 'x', img.height);
    };
    img.onerror = () => {
      console.error('❌ Image failed to load:', url);
      setError(`Image URL invalid or not accessible: ${url}`);
    };
    img.src = url;
  };

  const removeProfilePicture = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;

    try {
      const response = await api.delete('/api/delete/profile-picture');
      if (response.data.success) {
        // ✅ Update auth context
        if (response.data.user && updateUser) {
          updateUser(response.data.user);
        } else if (user) {
          updateUser({
            ...user,
            profile_picture_url: null
          });
        }
        
        onUploadSuccess(null);
        
        // Force refresh
        if (refreshUser) {
          setTimeout(() => refreshUser(), 500);
        }
      } else {
        setError(response.data.message || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(error.response?.data?.message || 'Failed to remove profile picture');
    }
  };

  const handleButtonClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Debug Info (Dev mode) */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="p-4 bg-gray-100 rounded-xl text-xs max-w-xs">
          <p className="font-bold">Debug Info:</p>
          <pre className="overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Current/Preview Profile Picture */}
      <div className="relative group">
        <div className={`${currentSize.container} rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-orange-400 to-red-500`}>
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          ) : currentPicture ? (
            <img 
              src={currentPicture} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('❌ Image failed to load:', currentPicture);
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user?.full_name || 'User'}&background=orange&color=white&size=128`;
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', currentPicture);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className={`${currentSize.camera} text-white opacity-70`} />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className={`absolute -bottom-2 -right-2 ${currentSize.button} bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10`}
          title={uploading ? 'Uploading...' : 'Change profile picture'}
          type="button"
        >
          {uploading ? (
            <Loader2 className={`${currentSize.icon} animate-spin`} />
          ) : (
            <Upload className={currentSize.icon} />
          )}
        </button>

        {/* Remove Button (if picture exists) */}
        {currentPicture && !preview && !uploading && (
          <button
            onClick={removeProfilePicture}
            className={`absolute -top-2 -right-2 ${currentSize.remove} bg-red-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-10`}
            title="Remove profile picture"
            type="button"
          >
            <X className={`${size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'}`} />
          </button>
        )}

        {/* Uploading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Display current picture URL */}
      {currentPicture && (
        <div className="text-center">
          <p className="text-xs text-gray-500 break-all max-w-xs">
            Current: {currentPicture}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm max-w-xs text-center">
          {error}
        </div>
      )}

      {/* File Input (Hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".jpg,.jpeg,.png,.gif,.webp"
        className="hidden"
      />

      {/* Upload Info */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Click the camera icon to upload a new profile picture
        </p>
        <p className="text-xs text-gray-500">
          Supported: JPG, PNG, GIF, WEBP • Max 5MB
        </p>
      </div>
    </div>
  );
}