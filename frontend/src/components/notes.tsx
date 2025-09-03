import { toast } from 'sonner';
import { Loader, Trash2 } from 'lucide-react';
import { deleteNote, getAllNotes } from '@/lib/apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface INote {
  id: string;
  title: string;
  content: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export default function Notes() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: getAllNotes,
    retry: 2,
  });

  const { mutate } = useMutation({
    mutationFn: deleteNote,
  });

  function handleDelete(id: string) {
    mutate(id, {
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: ['notes'] });
        toast.success(result.message);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete note');
      },
    });
  }

  if (isLoading) {
    return <Loader className="w-full place-self-center animate-spin " />;
  }

  return (
    <>
      {data?.notes?.length ? (
        <div className="w-full max-w-lg">
          <h3 className="text-lg font-semibold mb-3">Notes</h3>
          <div className="space-y-3">
            {data.notes.map((note: INote, idx: number) => (
              <div
                key={idx}
                className="flex justify-between items-center border border-gray-200 shadow-md rounded-xl px-4 py-2"
              >
                <span>{note.title}</span>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-gray-700 hover:text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No notes</div>
      )}
    </>
  );
}
