import Link from 'next/link';
import { Button } from '../button';

const links = [
  { name: 'Home', href: '/admin' },
  { name: 'Manage Students', href: '/admin/manage-students' },
  { name: 'Settings', href: '/admin/settings' },
];

export default function AdminNavLinks() {
  return (
    <>
      {links.map((link) => (
        <Button variant="link" key={link.name} className="w-full justify-start">
          <Link href={link.href}>{link.name}</Link>
        </Button>
      ))}
    </>
  );
}
