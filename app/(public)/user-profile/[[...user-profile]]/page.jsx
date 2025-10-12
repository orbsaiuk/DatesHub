import { UserProfile } from "@clerk/nextjs";

const UserProfilePage = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          إعدادات الحساب
        </h1>
      </div>
      <UserProfile />
    </div>
  </div>
);

export default UserProfilePage;
