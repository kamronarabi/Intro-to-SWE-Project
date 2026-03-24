import Link from 'next/link';
import { Button } from '../button';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/student'},
  {
    name: 'Practice',
    href: '/student/practice'
  },
  { name: 'Applications', href: '/student/applications'},
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        return (
          <Button variant="link" key={link.name} className="w-full justify-start">
            <Link href={link.href}>{link.name}</Link>
          </Button>
        );
      })}
    </>
  );
}