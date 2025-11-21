export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border rounded-lg shadow-sm p-8 text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Access Forbidden</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
      </div>
    </div>
  );
}
