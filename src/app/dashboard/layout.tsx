import Navbar from './components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='auth-shell bg-app-bg text-app-text-primary w-full overflow-x-hidden'>
      <Navbar />
      <main className='container max-w-7xl pt-20 pb-8'>{children}</main>
    </div>
  );
}
