import Link from 'next/link';
import NavLinks from '@/components/ui/student-dashboard/nav-links';
import { SignOutButton } from '@/components/sign-out-button';

interface SideNavProps {
  userName: string;
}

export default function SideNav({ userName }: SideNavProps) {
  return (
    <div className="flex h-full flex-col bg-gray-50 px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-white md:w-40">
          <h1 className="text-2xl font-bold">LevelUp</h1>
          <p className="text-xs text-blue-100">
            {userName ? `Welcome, ${userName}` : "Student Dashboard"}
          </p>
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
      </div>
      
      {/* Sign out button */}
      <div className="mt-4">
        <SignOutButton />
      </div>
    </div>
  );
}