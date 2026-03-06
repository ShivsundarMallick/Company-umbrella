import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-primary-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-500 max-w-md">
        {description || 'This feature is currently under development. Check back soon!'}
      </p>
      <div className="mt-6 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <span className="text-amber-700 text-sm font-medium">Coming Soon</span>
      </div>
    </div>
  );
}
