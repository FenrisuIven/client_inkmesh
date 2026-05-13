'use client';

export default function ProjectDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your project dashboard</h1>
      <p className="text-gray-500 max-w-md">
        Select a document from the sidebar to start writing, or create a new one using the button above.
      </p>
    </div>
  );
}
