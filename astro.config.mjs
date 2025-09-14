import { defineConfig } from 'astro/config'
import icon from 'astro-icon'
import sanity from '@sanity/astro'
import react from '@astrojs/react'
//import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [// partytown({
  //   config: {
  //     forward: ["dataLayer.push"],
  //   },
  // }), 
  sanity({
    projectId: "8icb2evz",
    dataset: 'production',
    apiVersion: '2023-08-09',
    useCdn: false,
  }),
  react(),
  icon()],
  image: {
    domains: ['https://graph.instagram.com/'],
    remotePatterns: [{protocol: 'https'}],
  }
})