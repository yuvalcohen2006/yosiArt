import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  // Pin the deployed studio hostname so `sanity deploy` always targets
  // yosiart.sanity.studio without the interactive hostname prompt.
  studioHost: 'yosiart',
  deployment: {
    // Locks the deployment target so `sanity deploy` doesn't prompt
    // for an application id after first deploy.
    appId: 'rfg9r95dwgzvaw0y6f58lrj7',
  },
});
