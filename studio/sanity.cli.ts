import { defineCliConfig } from 'sanity/cli';
import settings from '../src/data/blog-config.json';
export default defineCliConfig({
  deployment: { appId: 'mabja8ioca4vk2go4693sef4' },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || settings.projectId,
    dataset: process.env.SANITY_STUDIO_DATASET || settings.dataset,
  },
});
