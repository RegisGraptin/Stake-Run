import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { scrollSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Stake and Run',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    scrollSepolia,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [scrollSepolia] : []),
  ],
  ssr: true,
});