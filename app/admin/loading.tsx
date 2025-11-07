import Loading from '@/components/Loading';

export default function AdminLoading() {
  return (
    <div className="lg:ml-64 flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
      <div className="max-w-7xl mx-auto">
        <Loading fullScreen={false} />
      </div>
    </div>
  );
}

