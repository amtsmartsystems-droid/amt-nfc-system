import './globals.css';

export const metadata = {
  title: 'واجهة المطعم الذكية',
  description: 'واجهة المطعم الرقمية الذكية — تصفح المنيو، اطلب، وقيّم تجربتك.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
