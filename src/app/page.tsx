import Image from 'next/image';

export default function Page() {
  return (
    <main className='flex h-screen w-screen items-center justify-center'>
      <Image
        src='/PM0-logo.webp'
        alt='Logo PM0'
        height={512}
        width={512}
        className='h-64 w-auto object-contain'
      />
    </main>
  );
}
