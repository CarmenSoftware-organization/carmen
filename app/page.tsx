import StatusBadge from "@/components/ui/custom-status-badge";
import { BadgeStatus } from "@/components/ui/custom-status-badge";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Carmen</h1>
      <p className="text-xl mb-8">Please sign in to access the application.</p>
      <div className="space-x-4">
        <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign In
        </Link>
        <Link href="/dashboard" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Go to Menu
        </Link>
      </div>
    </div>
  );
}
