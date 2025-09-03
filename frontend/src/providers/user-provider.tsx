import type React from 'react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserContext, type IUser } from '@/contexts/user.context';
import { getProfile } from '@/lib/apis';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setUser({ name: data.user.name, email: data.user.email });
    } else if (isError) {
      setUser(null);
    }
  }, [data, isError]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}
