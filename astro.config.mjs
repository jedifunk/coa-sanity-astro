import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import image from "@astrojs/image";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  integrations: [partytown({
    config: {
      forward: ["dataLayer.push"],
    },
  }), react(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  }),]
});