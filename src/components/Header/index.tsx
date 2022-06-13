import Link from 'next/link';

export default function Header() {
  return (
    <header>
      <Link href={'/'}>
        <a>
          <img src="../../public/logo.svg" alt="logo" />;
        </a>
      </Link>
    </header>
  );
}
