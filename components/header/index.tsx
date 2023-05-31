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

const Header = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

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

      <div style={{ display: 'flex', gap: '12px', verticalAlign: 'middle' }}>
        <Menu>
          {() => (
            <>
              <Button
                size='sm'
                colorScheme="purple"
                onClick={() => setIsOpen(true)}
              >
                Feedback
              </Button>
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
                    <Text fontSize="sm" fontWeight="semibold">
                      {session.user.name}
                    </Text>
                  </button>
                )}
              </MenuButton>
              <MenuList>

                <MenuItem ><Link href="https://billing.stripe.com/p/login/test_eVa02A8e6glT3QI5kk">Subscription</Link></MenuItem>
                <MenuItem onClick={() => signOut()}>Logout</MenuItem>
              </MenuList>
            </>
          )}
        </Menu>
      </div>


      <PopupModal
        url="https://calendly.com/wandaai/wizard-early-access"
        /*
         * react-calendly uses React's Portal feature (https://reactjs.org/docs/portals.html) to render the popup modal. As a result, you'll need to
         * specify the rootElement property to ensure that the modal is inserted into the correct domNode.
         */
        rootElement={document.getElementById("__next") as HTMLElement}
        onModalClose={() => setIsOpen(false)}
        open={isOpen}
      />
    </header>
  );
};

export default Header;
