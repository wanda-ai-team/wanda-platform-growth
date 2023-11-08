import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Wanda</title>
        <meta property="og:title" content="Wanda" key="title" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
