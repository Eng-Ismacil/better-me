import PageSkeleton from '@/components/ui/PageSkeleton';
export default function Loading() { return <div className='min-h-screen bg-[#FCF9F8] flex'><div className='flex-1 flex flex-col md:pl-64'><main className='flex-1 w-full max-w-lg md:max-w-4xl mx-auto pt-24 md:pt-10 pb-24 md:pb-12 px-4 md:px-8'><PageSkeleton rows={5} cards={3} /></main></div></div>; }
