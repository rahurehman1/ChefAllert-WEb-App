// src/components/Avatar.tsx - Reusable avatar component
import { User, ChefHat } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: 'client' | 'chef' | 'admin';
  className?: string;
}

export function Avatar({ src, alt, size = 'md', role = 'client', className = '' }: AvatarProps) {
  const resolveSrc = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const base = 'http://localhost:5001';
    if (value.startsWith('/')) return `${base}${value}`;
    return `${base}/${value}`;
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const roleColors = {
    client: 'from-blue-500 to-blue-600',
    chef: 'from-orange-500 to-red-500',
    admin: 'from-purple-500 to-purple-600'
  };

  // Agar image URL hai to use karein
  const finalSrc = resolveSrc(src);
  if (finalSrc) {
    return (
      <img 
        src={finalSrc} 
        alt={alt}
        className={`${sizeClasses[size]} rounded-xl object-cover border-2 border-white shadow-md ${className}`}
        onError={(e) => {
          // Fallback agar image load nahi ho
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.innerHTML = `
            <div class="${sizeClasses[size]} rounded-xl bg-gradient-to-r ${roleColors[role]} flex items-center justify-center">
              ${role === 'chef' 
                ? '<svg class="' + iconSizes[size] + ' text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' 
                : '<svg class="' + iconSizes[size] + ' text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
              }
            </div>
          `;
        }}
      />
    );
  }

  // Agar image nahi hai to gradient background with icon
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-r ${roleColors[role]} flex items-center justify-center shadow-md ${className}`}>
      {role === 'chef' ? (
        <ChefHat className={`${iconSizes[size]} text-white`} />
      ) : (
        <User className={`${iconSizes[size]} text-white`} />
      )}
    </div>
  );
}