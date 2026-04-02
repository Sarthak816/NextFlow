import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)] bg-black">
      <SignIn />
    </div>
  );
}
