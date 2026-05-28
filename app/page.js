'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKENS_LIST } from '../config';
import { RefreshCw, Wallet, Play, XCircle, ShieldCheck, AlertCircle, Copy, Check, List } from 'lucide-react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [mounted, setMounted] = useState(false);
  const [tokenOut, setTokenOut] = useState('');
  const [amountPerTx, setAmountPerTx] = useState('0.01'); // Valor padrão seguro e baixo
  const [daysInterval, setDaysInterval] = useState('3');
  const [targetPrice, setTargetPrice] = useState('50000'); // Preço alvo alto para evitar reversão imediata
  const [totalDeposit, setTotalDeposit] = useState('0.1'); // Depósito total proporcional e aceitável pela testnet
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Leitura em tempo real do Smart Contract para buscar a ordem ativa do usuário
  const { data: activeOrder, refetch, isRefetching } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'orders',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const handleCreateDCA = async (e) => {
    e.preventDefault();
    if (!isAddress(tokenOut)) return alert("Please enter a valid ERC-20 token address.");
    if (!amountPerTx || !totalDeposit || !targetPrice) return alert("Please fill in all input fields.");

    setLoading(true);
    try {
      // Converte a frequência de dias escolhida para segundos (Ex: 3 dias = 259200 segundos)
      const intervalSeconds = BigInt(parseFloat(daysInterval) * 24 * 60 * 60);

      // Tratamento preventivo de decimais para evitar falhas de lógica do limitador do sequenciador
      const formattedTargetPrice = parseEther(targetPrice); 

      console.log("Submitting transaction arguments...");
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createDCAOrder',
        args: [tokenOut, parseEther(amountPerTx), intervalSeconds, formattedTargetPrice],
        value: parseEther(totalDeposit),
      });

      alert("🚀 DCA Strategy initiated successfully!");
      setTimeout(() => refetch(), 3000);
    } catch (err) {
      console.error("Transaction failed:", err);
      if (err.message.includes("limit") || err.message.includes("rate limit") || err.message.includes("exceeds defined limit")) {
        alert("⚠️ RPC Node Restriction: The LiteForge testnet rejected the transaction volume/value. Try reducing your Total Deposit to 0.05 zkLTC and use a higher Target Price threshold to prevent immediate contract validation failure.");
      } else {
        alert("Transaction Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDCA = async () => {
    setLoading(true);
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'cancelDCA',
      });
      alert("🛑 Strategy canceled. Remaining funds returned to your wallet.");
      setTimeout(() => refetch(), 3000);
    } catch (err) {
      console.error(err);
      alert("Error canceling strategy: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Dynamic Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
            🛡️ DCA LITE FINANCE
          </div>
          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">LitVM Network</p>
            <p className="text-[11px] text-slate-400">LiteForge Environment</p>
          </div>
        </div>
        <ConnectButton chainStatus="icon" showBalance={true} />
      </header>

      {/* Grid Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Forms and Strategy Management) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Active Strategy Dashboard Section */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <RefreshCw className={`h-3.5 w-3.5 text-blue-400 ${isRefetching ? 'animate-spin' : ''}`} />
                Active Strategy Monitor
              </h2>
              {isConnected && (
                <button onClick={() => refetch()} className="text-xs text-blue-400 hover:underline">
                  Refresh State
                </button>
              )}
            </div>

            {!isConnected ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                Connect your Web3 wallet to manage running DCA automated nodes.
              </div>
            ) : activeOrder && activeOrder[6] ? (
              <div className="bg-slate-900/60 rounded-xl p-5 border border-blue-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-xl border-l border-b border-blue-500/20">
                  Active Operational Status
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div>
                    <p className="text-slate-400 text-xs">Target Out Token</p>
                    <p className="font-mono text-slate-200 truncate text-xs">{activeOrder[1]}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Contract Balance</p>
                    <p className="font-bold text-emerald-400">{formatEther(activeOrder[5])} zkLTC</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Allocation Per Execution</p>
                    <p className="text-slate-200 font-semibold">{formatEther(activeOrder[2])} zkLTC</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Max Ceiling Target Price</p>
                    <p className="text-slate-200 font-semibold">{formatEther(activeOrder[7])} USD</p>
                  </div>
                </div>
                <button
                  onClick={handleCancelDCA}
                  disabled={loading}
                  className="mt-5 w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 transition-all font-medium py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Cancel Automation & Retrieve Locked Assets
                </button>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                <AlertCircle className="h-7 w-7 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-medium">No live active DCA structure found linked to this address.</p>
              </div>
            )}
          </div>

          {/* New DCA Automation Panel */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2 mb-1">
              <Play className="h-4 w-4 text-blue-500 fill-blue-500" /> Initialize DCA Strategy
            </h2>
            <p className="text-xs text-slate-400 mb-6">Deploy a secure non-custodial automated buying sequence based on precise on-chain execution.</p>

            <form onSubmit={handleCreateDCA} className="flex flex-col gap-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Target Asset Token (ERC-20 Address)</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={tokenOut}
                  onChange={(e) => setTokenOut(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-700 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Amount Per Purchase (zkLTC)</label>
                  <input
                    type="number"
                    step="any"
                    value={amountPerTx}
                    onChange={(e) => setAmountPerTx(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-200 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Frequency Interval</label>
                  <select
                    value={daysInterval}
                    onChange={(e) => setDaysInterval(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-200 transition-colors"
                  >
                    <option value="1">Daily (1 Day)</option>
                    <option value="3">3 Days Interval</option>
                    <option value="7">Weekly (7 Days)</option>
                    <option value="30">Monthly (30 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Max Execution Target Price (USD)</label>
                  <input
                    type="number"
                    placeholder="Ex: 65000"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-200 placeholder:text-slate-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Total Funding Escrow Deposit (zkLTC)</label>
                  <input
                    type="number"
                    step="any"
                    value={totalDeposit}
                    onChange={(e) => setTotalDeposit(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-slate-200 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isConnected}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 font-semibold text-sm text-white py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
              >
                {loading ? "Authorizing Node..." : !isConnected ? "Connect Web3 Wallet First" : "Deploy DCA Strategy Node"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (Reference Tools & Network Token Registry) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Escrow Mechanism Explainer Card */}
          <div className="bg-gradient-to-b from-slate-800/60 to-slate-800/20 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4" /> Fully Decentralized Escrow
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your deposited capital stays isolated inside the immutable deployment contract. Safe, fully audited, and retrievable by your own signature authority at any given computational timestamp.
            </p>
          </div>

          {/* Network Verified Asset Registry List */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-5">
              <List className="h-3.5 w-3.5 text-indigo-400" /> Verified Network Assets (LiteForge)
            </h3>
            
            <div className="flex flex-col gap-3">
              {TOKENS_LIST.map((token, index) => (
                <div key={token.symbol} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px] text-blue-400 border border-slate-700 shrink-0">
                      {token.symbol.substring(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-200">{token.symbol}</span>
                        {token.isNative && (
                          <span className="text-[8px] bg-blue-500/10 text-blue-400 font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border border-blue-500/20">
                            NATIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{token.name}</p>
                    </div>
                  </div>

                  {!token.isNative && (
                    <button
                      onClick={() => {
                        setTokenOut(token.address);
                        copyToClipboard(token.address, index);
                      }}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-all border border-transparent hover:border-slate-700 shrink-0"
                      title="Copy & Autofill Address"
                    >
                      {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
