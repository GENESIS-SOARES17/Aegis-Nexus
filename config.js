import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

export const liteForge = {
  id: 4441,
  name: 'LitVM LiteForge',
  nativeCurrency: { name: 'zkLTC', symbol: 'zkLTC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://liteforge.rpc.caldera.xyz/http'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://liteforge.explorer.caldera.xyz' },
  },
};

// Configuração utilizando o ID padrão de demonstração do Reown/WalletConnect para evitar bloqueios de origem local
export const config = getDefaultConfig({
  appName: 'LiteForge DCA',
  projectId: '43d7ee824429abab38313a30c5e39be1', 
  chains: [liteForge],
  transports: {
    [liteForge.id]: http(),
  },
});

export const CONTRACT_ADDRESS = "0xC06F6eB12037c6a95D5B7199237356E0d6e74D8C";

// Lista de Tokens Oficiais e de Teste mapeados na LitVM LiteForge
export const TOKENS_LIST = [
  { symbol: "zkLTC", name: "Liquid Litecoin (Native)", address: "0x0000000000000000000000000000000000000000", isNative: true },
  { symbol: "wzkLTC", name: "Wrapped zkLTC", address: "0xdf474006aa807598b616500d146fff661d644138", isNative: false },
  { symbol: "USDT", name: "Tether USD (Testnet)", address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", isNative: false },
  { symbol: "USDC", name: "USD Coin (Testnet)", address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", isNative: false },
  { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", isNative: false }
];

export const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_tokenOut", "type": "address" },
      { "internalType": "uint256", "name": "_amountPerExecution", "type": "uint256" },
      { "internalType": "uint256", "name": "_interval", "type": "uint256" }
    ],
    "name": "createDCAOrder",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelDCA",
    "outputs": [],
    "stateMutability": "none",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "orders",
    "outputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "address", "name": "tokenOut", "type": "address" },
      { "internalType": "uint256", "name": "amountPerExecution", "type": "uint256" },
      { "internalType": "uint256", "name": "interval", "type": "uint256" },
      { "internalType": "uint256", "name": "lastExecution", "type": "uint256" },
      { "internalType": "uint256", "name": "remainingFunds", "type": "uint256" },
      { "internalType": "bool", "name": "isActive", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
