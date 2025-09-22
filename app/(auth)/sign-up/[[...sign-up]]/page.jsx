import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              card: "shadow-lg rounded-lg",
              formFieldInput: "text-right",
              formFieldLabel: "text-right",
              headerTitle: "text-right",
              headerSubtitle: "text-right",
              socialButtonsBlockButton: "text-right",
              footer: "text-right",
            },
          }}
        />
      </div>
    </div>
  );
}
