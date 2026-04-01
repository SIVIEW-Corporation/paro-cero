import Navbar from './components/Navbar';

export default function DashboardLayout({
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
