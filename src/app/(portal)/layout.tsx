import Navbar from '@/app/dashboard/components/Navbar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='w-full overflow-x-hidden'>
      <Navbar />
      <main className='container max-w-7xl pt-16'>{children}</main>
    </div>
  );
}
