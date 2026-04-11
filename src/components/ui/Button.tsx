import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-red' | 'secondary-navy' | 'primary-navy';
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = 'primary-red', href, className = '', children, ...props }: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg px-6 py-3 transition-colors duration-200';
  
  const variants = {
    'primary-red': 'bg-red-accent text-white hover:bg-red-accent/90 shadow-sm',
    'secondary-navy': 'bg-transparent border-2 border-navy-primary text-navy-primary hover:bg-navy-primary hover:text-white shadow-sm',
    'primary-navy': 'bg-navy-primary text-white hover:bg-navy-primary/90 shadow-sm',
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
