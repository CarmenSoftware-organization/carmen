import Link from "next/link";


export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
        {/* Implement your own signup form here */}
        <p>Signup form goes here</p>
        <Link href="/login" className="text-blue-500 hover:underline mt-4 block">
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}