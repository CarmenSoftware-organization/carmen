import Link from "next/link";


export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        {/* Implement your own login form here */}
        <p>Login form goes here</p>
        <Link href="/signup" className="text-blue-500 hover:underline mt-4 block">
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </div>
  );
}