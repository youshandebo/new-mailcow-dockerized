interface BadgeProps {
  count: number;
  variant?: 'primary' | 'secondary';
}

export default function Badge({ count, variant = 'primary' }: BadgeProps) {
  if (count <= 0) return null;

  const variantClasses = {
    primary: 'bg-qq-blue text-white',
    secondary: 'bg-qq-text-secondary text-white',
  };

  return (
    <span className={`${variantClasses[variant]} text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-medium`}>
      {count > 999 ? '999+' : count}
    </span>
  );
}
