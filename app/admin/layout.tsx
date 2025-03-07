export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <main className="container mx-auto px-4 py-8 ">
    </main> */}
    {children}
    </div>
  );
}
