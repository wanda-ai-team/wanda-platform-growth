import { useRouter } from "next/router";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
    const router = useRouter();  // -> Access Next.js Router here

    useEffect(() => {
        let id = uuidv4();
        router.push(`/autotest/${id}`)
      }, [])
}

export default Index
