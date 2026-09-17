const LOGOS = {
  symbol: '/brand/logo1.png',
  horizontal: '/brand/logo2.png',
  stacked: '/brand/logo3.png',
};

export function BrandLogo({ variant = 'horizontal', className = '', alt = 'Tatparya', loading = 'eager' }) {
  return (
    <img
      src={LOGOS[variant] || LOGOS.horizontal}
      alt={alt}
      className={`block object-contain ${className}`}
      loading={loading}
      decoding="async"
    />
  );
}
