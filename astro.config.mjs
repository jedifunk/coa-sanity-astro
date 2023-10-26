import { defineConfig } from 'astro/config'
//import {loadEnv} from 'vite'
import react from "@astrojs/react"
import sanity from '@sanity/astro'
import partytown from "@astrojs/partytown";
//const {PUBLIC_ID} = loadEnv(process.env.PUBLIC_SANITY_PROJECT_ID, process.cwd(), "")

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
      //projectId: PUBLIC_ID,
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