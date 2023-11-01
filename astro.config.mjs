import react from "@astrojs/react"
import sanity from '@sanity/astro'
import partytown from "@astrojs/partytown";
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [
    // partytown({
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
  ],
  image: {
    domains: ['https://graph.instagram.com/'],
    remotePatterns: [{protocol: 'https'}],
  }
})