import { useUser } from '@/contexts/user.context';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export default function AuthLayout() {
  const navigate = useNavigate();

  const { user, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <Loader className="w-full place-self-center animate-spin " />;
  }

  return (
    <div className="flex gap-0 w-full">
      <div className="flex flex-col flex-1 p-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <h3 className="text-2xl font-bold uppercase">hd</h3>
        </div>

        <div className="flex flex-1 items-center justify-center px-16">
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex h-screen">
        <img src="/hero.png" alt="Hero image" className="h-full object-cover" />
      </div>
    </div>
  );
}
