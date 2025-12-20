interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-navy',
    'bg-burgundy',
    'bg-sage',
    'bg-terracotta',
    'bg-slate',
    'bg-navy-light',
    'bg-gold-muted',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export const Avatar = ({ src, alt, name = '', size = 'md', className = '' }: AvatarProps) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-cream ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${getColorFromName(name)} rounded-full flex items-center justify-center text-ivory font-medium ring-2 ring-cream ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

