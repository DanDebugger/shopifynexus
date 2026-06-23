import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <title>NexusLab - Premium Custom PC Bundles</title>
        <meta name="description" content="Shop NexusLab custom PC bundles built for gaming, school, streaming, editing, and everyday work." />
        <meta property="og:title" content="NexusLab - Premium Custom PC Bundles" />
        <meta property="og:description" content="Shop NexusLab custom PC bundles built for gaming, school, streaming, editing, and everyday work." />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
