interface AvatarProps {
  name: string;
  email: string;
  size?: 'sm' | 'md' | 'lg';
}

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export default function Avatar({ name, email, size = 'md' }: AvatarProps) {
  const color = colors[hashCode(email) % colors.length];
  const initial = (name || email || '?')[0].toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {initial}
    </div>
  );
}
