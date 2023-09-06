import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import styles from "@/styles/Header.module.css";
import { signOut, useSession } from "next-auth/react";
import { PopupModal } from "react-calendly";
import { useState } from "react";
import { useRouter } from "next/router";

const Header = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <header className={styles.navbar__container}>
      <Link aria-label="Wanda AI Logo" href="/">
        <Image
          src="/assets/logo/Logo.png"
          alt="AI"
          width="138"
          height="32"
          priority={true}
        />
      </Link>

      {!router.pathname.includes('onboarding') && !router.pathname.includes('login') && (
        <div style={{ display: 'flex', gap: '12px', verticalAlign: 'middle' }}>
          <Button
            size='sm'
            colorScheme="purple"
            onClick={() => router.push('/dashboard')}
          >
            Create
          </Button>
          <Button
            size='sm'
            colorScheme="purple"
            onClick={() => router.push('/reporpuse')}
          >
            Reporpuse
          </Button>
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', verticalAlign: 'middle' }}>
        <Menu>
          {() => (
            <>
              <a  target="_blank" href="https://app.frill.co/embed/widget/39ae3c1b-25d9-4212-8e67-fc56fb451206">
                <Button
                  size='sm'
                  colorScheme="purple"
                >
                  Feedback
                </Button>
              </a>
              <MenuButton>
                {session?.user?.name && (
                  <button className={styles.dropdown__trigger}>
                    <Avatar
                      name={session.user.name}
                      size="sm"
                      sx={{
                        borderRadius: "10px",
                      }}
                    />
                    {session.user.name}
                  </button>
                )}
              </MenuButton>
              <MenuList>

                {/* <MenuItem ><Link href="https://billing.stripe.com/p/login/test_eVa02A8e6glT3QI5kk">Subscription</Link></MenuItem> */}
                <MenuItem onClick={() => signOut()}>Logout</MenuItem>
              </MenuList>
            </>
          )}
        </Menu>
      </div>

      {typeof window !== 'undefined' && (
        <PopupModal
          url="https://calendly.com/wandaai/wizard-early-access"
          rootElement={document.getElementById("__next") as HTMLElement}
          onModalClose={() => setIsOpen(false)}
          open={isOpen}
        />
      )}
    </header>
  );
};

export default Header;
