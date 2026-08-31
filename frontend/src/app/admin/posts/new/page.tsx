import AdminGuard from '@/components/AdminGuard';
import PostForm from '../PostForm';

export default function NewPostPage() {
  return (
    <AdminGuard>
      <h1 className="text-2xl mb-6 heading-gradient inline-block">Viết bài mới</h1>
      <PostForm />
    </AdminGuard>
  );
}
