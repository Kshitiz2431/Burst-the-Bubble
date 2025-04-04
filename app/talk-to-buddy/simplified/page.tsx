import SimplifiedForm from "../SimplifiedForm";

export default function SimplifiedFormPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#e27396] mb-8">
          Simplified Talk to Buddy Demo
        </h1>
        <SimplifiedForm />
      </div>
    </div>
  );
} 