import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página en desarrollo',
  robots: {
    index: false,
    follow: false,
  },
};

function page() {
  return <div>page</div>;
}

export default page;
