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

const Header = () => {
  const { data: session } = useSession();

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

      <Menu>
        {() => (
          <>
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
    </header>
  );
};

export default Header;
