import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Notes from '@/components/notes';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/user.context';
import { signout } from '@/lib/apis';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user, setUser, isLoading } = useUser();

  const { mutate: signoutMutate } = useMutation({
    mutationFn: signout,
  });

  async function handleSignout() {
    signoutMutate(undefined, {
      onSuccess: async (result) => {
        setUser(null);
        navigate('/signin');
        queryClient.removeQueries({ queryKey: ['profile'] });
        toast.success(result.message);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to Logout');
      },
    });
  }

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <Loader className="w-full place-self-center animate-spin " />;
  }

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center px-4 sm:px-8 lg:px-16 py-6">
      <header className="w-full flex justify-between items-center mb-4">
        <div className="flex gap-6">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <h1 className="text-xl font-semibold flex items-center gap-2">
            Dashboard
          </h1>
        </div>

        <Button onClick={handleSignout} variant="link" className="text-base">
          Sign Out
        </Button>
      </header>

      <div className="w-full max-w-lg border border-gray-200 shadow-md rounded-xl p-4">
        <h2 className="text-lg font-bold text-gray-900">
          Welcome, {user?.name}
        </h2>
        <p className="text-gray-600 text-sm mt-1">
          <strong>Email:</strong> {user?.email}
        </p>
      </div>

      <Button className="w-full max-w-lg">Create Note</Button>

      <Notes />
    </div>
  );
}
