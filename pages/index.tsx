import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useState } from 'react'
import { Button, Input } from '@chakra-ui/react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [mediumUrl, setMediumUrl] = useState('');
  const [twitterThread, setTwitterThread] = useState('');

  function getTextFromMediumPage() {
    fetch('/api/webScrapping/getMediumSection?url=' + mediumUrl)
      .then((res) => res.json())
      .then((data) => {
        fetch('/api/llm/gpt3/mediumToThread?mediumText=' + data.section)
          .then((res) => res.json())
          .then((data) => {
            console.log(data);
            setTwitterThread(data.content)
          }).catch((err) => {
            console.log(err);
          });
      }).catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Input placeholder='Medium URL' value={mediumUrl}
          onChange={(e) => setMediumUrl(e.target.value)} />
        <Button colorScheme='purple' onClick={getTextFromMediumPage}>Submit</Button>
        <p>
          {twitterThread}
        </p>
      </main>
    </>
  )
}
