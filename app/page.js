'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { CONTRACT_ADDRESS, CONTRACT_ABI, TOKENS_LIST } from '../config';
import { RefreshCw, Wallet, Play, XCircle, ShieldCheck, AlertCircle, Copy, Check, Calculator, List, ArrowRightLeft, TrendingUp, Radio } from 'lucide-react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [mounted, setMounted] = useState(false);
  const [tokenOut, setTokenOut] = useState('');
  const [amountPerTx, setAmountPerTx] = useState('');
  const [daysInterval, setDaysInterval] = useState('3');
  const [targetPrice, setTargetPrice] = useState('');
  const [totalDeposit, setTotalDeposit] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('tokens');

  // Simulated Live Prices State
  const [prices, setPrices] = useState({
    zkLTC: 85.42,
    wzkLTC: 85.42,
    USDT: 1.00,
    USDC: 1.00,
    WBTC: 64250.00
  });

  useEffect(() => {
    setMounted(true);
    
    // Simulate real-time price ticks for the testnet tokens
    const interval = setInterval(() => {
      setPrices(prev => ({
        zkLTC: +(prev.zkLTC + (Math.random() - 0.5) * 0.1).toFixed(2),
        wzkLTC: +(prev.zkLTC).toFixed(2), // Pegged to zkLTC
        USDT: +(1.00 + (Math.random() - 0.5) * 0.002).toFixed(4),
        USDC: +(1.00 + (Math.random() - 0.5) * 0.001).toFixed(4),
        WBTC: +(prev.WBTC + (Math.random() - 0.5) * 15).toFixed(2)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const { data: userOrder, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'orders',
    args: address ? [address] : undefined,
    query: { enabled: !!address && mounted }
  });

  const handleCreateDCA = async (e) => {
    e.preventDefault();
    if (!isAddress(tokenOut)) return alert("Please enter a valid ERC-20 token address.");
    if (!amountPerTx || !totalDeposit || !targetPrice) return alert("Please fill in all fields.");

    setLoading(true);
    try {
      const intervalSeconds = BigInt(parseFloat(daysInterval) * 24 * 60 * 60);
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createDCAOrder',
        args: [tokenOut, parseEther(amountPerTx), intervalSeconds, parseEther(targetPrice)],
        value: parseEther(totalDeposit),
      });
      alert("Transaction submitted successfully!");
      setTimeout(() => refetch(), 4000);
    } catch (err) {
      console.error(err);
      alert("Transaction error: " + err.message);
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
      alert("Strategy canceled and remaining funds returned!");
      setTimeout(() => refetch(), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTokenOut(text);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectedTokenObj = TOKENS_LIST.find(t => t.address.toLowerCase() === tokenOut.toLowerCase());
  const targetTokenSymbol = selectedTokenObj ? selectedTokenObj.symbol : (isAddress(tokenOut) ? 'Selected Token' : '---');

  const simTotalBuys = (amountPerTx && totalDeposit) ? Math.floor(parseFloat(totalDeposit) / parseFloat(amountPerTx)) : 0;
  const simTotalDays = simTotalBuys * parseInt(daysInterval);
  const simTokensAcquired = (amountPerTx && targetPrice && parseFloat(targetPrice) > 0) 
    ? (parseFloat(amountPerTx) / parseFloat(targetPrice)) * simTotalBuys 
    : 0;

  const hasActiveOrder = userOrder && userOrder[6] === true;

  if (!mounted) return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Loading dApp...</div>;

  return (
    <main className="h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 px-4 py-4 flex flex-col overflow-hidden text-slate-100">
      
      {/* INJECTING TICKER ANIMATION TYPOGRAPHY IN DOM */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* HEADER BAR */}
      <header className="max-w-7xl w-full mx-auto flex flex-row justify-between items-center pb-4 mb-4 border-b border-slate-800/80 shrink-0 gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="DCA Lite Finance Logo" 
              className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            />
          </div>
          <div className="hidden md:block h-12 w-[1px] bg-slate-800"></div>
          <div className="hidden md:block">
            <p className="text-lg tracking-widest text-blue-400 uppercase font-extrabold leading-none mb-1">LitVM Network</p>
            <p className="text-sm text-slate-400 font-medium leading-none">LiteForge Environment</p>
          </div>
        </div>

        {/* MIDDLE SECTION: LIVE TICKER BANNER (REPLACES THE EMPTY SPACE) */}
        <div className="flex-1 max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-2 bg-slate-950/60 border border-slate-800/60 rounded-xl h-12 flex items-center overflow-hidden relative shadow-inner group">
          <div className="absolute left-0 top-0 bottom-0 px-2 bg-slate-900 border-r border-slate-800 flex items-center gap-1 z-10 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
            <Radio size={12} className="animate-pulse text-emerald-400" /> Live
          </div>
          
          <div className="animate-marquee whitespace-nowrap flex items-center pl-16">
            {/* Loop 1 */}
            <span className="text-[11px] text-slate-300 font-medium inline-flex items-center gap-6">
              <span className="text-blue-400 font-semibold bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/30">💡 ABOUT:</span>
              DCA Lite Finance is a lightweight, high-performance decentralized application (dApp) engineered for the LitVM Network (LiteForge Environment). It empowers users to execute conditional, hands-free Dollar-Cost Averaging (DCA) investment strategies directly on-chain without giving up custody of their private keys.
              <span className="text-emerald-400 font-bold flex items-center gap-1 mx-2"><TrendingUp size={12}/> TESTNET TICKERS:</span>
              <span className="font-mono text-slate-200">zkLTC: <span className="text-emerald-400 font-bold">${prices.zkLTC}</span></span>
              <span className="font-mono text-slate-200">wzkLTC: <span className="text-emerald-400 font-bold">${prices.wzkLTC}</span></span>
              <span className="font-mono text-slate-200">USDT: <span className="text-slate-300">${prices.USDT}</span></span>
              <span className="font-mono text-slate-200">USDC: <span className="text-slate-300">${prices.USDC}</span></span>
              <span className="font-mono text-slate-200">WBTC: <span className="text-emerald-400 font-bold">${prices.WBTC}</span></span>
              <span className="text-blue-400 font-semibold bg-blue-950/40 px-2 py-0.5 rounded">📰 NEWS:</span>
              <span className="text-slate-300 italic">LiteForge testnet core settlement speed optimized to sub-second validation.</span>
            </span>

            {/* Loop 2 (Duplicate for seamless infinite scroll effect) */}
            <span className="text-[11px] text-slate-300 font-medium inline-flex items-center gap-6 ml-6">
              <span className="text-blue-400 font-semibold bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/30">💡 ABOUT:</span>
              DCA Lite Finance is a lightweight, high-performance decentralized application (dApp) engineered for the LitVM Network (LiteForge Environment). It empowers users to execute conditional, hands-free Dollar-Cost Averaging (DCA) investment strategies directly on-chain without giving up custody of their private keys.
              <span className="text-emerald-400 font-bold flex items-center gap-1 mx-2"><TrendingUp size={12}/> TESTNET TICKERS:</span>
              <span className="font-mono text-slate-200">zkLTC: <span className="text-emerald-400 font-bold">${prices.zkLTC}</span></span>
              <span className="font-mono text-slate-200">wzkLTC: <span className="text-emerald-400 font-bold">${prices.wzkLTC}</span></span>
              <span className="font-mono text-slate-200">USDT: <span className="text-slate-300">${prices.USDT}</span></span>
              <span className="font-mono text-slate-200">USDC: <span className="text-slate-300">${prices.USDC}</span></span>
              <span className="font-mono text-slate-200">WBTC: <span className="text-emerald-400 font-bold">${prices.WBTC}</span></span>
              <span className="text-blue-400 font-semibold bg-blue-950/40 px-2 py-0.5 rounded">📰 NEWS:</span>
              <span className="text-slate-300 italic">LiteForge testnet core settlement speed optimized to sub-second validation.</span>
            </span>
          </div>
        </div>

        <div className="scale-105 origin-right shrink-0">
          <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
        </div>
      </header>

      {/* SYMMETRIC DYNAMIC GRID */}
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 pb-2">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          
          {/* 1. YOUR ACTIVE POSITION */}
          <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 shadow-xl shrink-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <RefreshCw size={12} className="text-emerald-400" />
                Your Active Position
              </h3>
              {isConnected && (
                <button onClick={() => refetch()} className="text-[11px] text-blue-400 hover:underline">Refresh</button>
              )}
            </div>

            {!isConnected || !hasActiveOrder ? (
              <div className="text-center py-4 text-xs text-slate-400 flex flex-col items-center gap-1 bg-slate-950/40 rounded-lg border border-slate-900/60 p-3">
                <AlertCircle size={18} className="text-slate-500" />
                <span>No active strategy found for this wallet.</span>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[9px]">Target Token</span>
                  <span className="font-mono text-slate-200 break-all">{userOrder[1]}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[8px]">Amount / Buy</span>
                    <span className="text-slate-100 font-bold">{formatEther(userOrder[2])} zkLTC</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[8px]">Frequency</span>
                    <span className="text-slate-100 font-bold">{(Number(userOrder[3]) / 86400).toFixed(0)} days</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <span className="text-slate-400 block mb-0.5 uppercase tracking-wider font-semibold text-[8px]">Target Price</span>
                    <span className="text-blue-400 font-bold">{userOrder[7] ? formatEther(userOrder[7]) : '0.0'} zkLTC</span>
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-lg flex justify-between items-center">
                  <span className="text-emerald-400 uppercase tracking-wider font-semibold text-[9px]">Remaining Balance</span>
                  <span className="font-bold text-emerald-300 text-sm">{formatEther(userOrder[5])} zkLTC</span>
                </div>
                <button onClick={handleCancelDCA} disabled={loading} className="w-full flex items-center justify-center gap-1 bg-red-950/40 text-red-400 border border-red-900/60 p-2 rounded-lg font-semibold hover:bg-red-900/40 transition-all text-[11px]">
                  <XCircle size={12} /> Cancel DCA & Withdraw
                </button>
              </div>
            )}
          </div>

          {/* 2. NEW DCA ORDER FORM */}
          <div className="bg-slate-900/40 backdrop-blur-md p-5 rounded-xl border border-slate-800/80 shadow-xl flex flex-col justify-center flex-1 min-h-0">
            <div className="mb-2">
              <h2 className="text-sm font-bold flex items-center gap-2 text-slate-100">
                <Play size={14} className="text-blue-400" />
                New DCA Order
              </h2>
              <p className="text-[11px] text-slate-300">Set automation rules and conditional buying targets.</p>
            </div>

            {!isConnected ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-lg bg-slate-950/20 my-auto">
                <Wallet className="mx-auto text-slate-500 mb-1" size={24} />
                <p className="text-xs text-slate-400">Connect your wallet to start</p>
              </div>
            ) : (
              <form onSubmit={handleCreateDCA} className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wide mb-1">Output Token Address</label>
                  <input type="text" placeholder="0x..." className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-mono transition-colors" value={tokenOut} onChange={(e) => setTokenOut(e.target.value)} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wide mb-1">Amount Per Buy (zkLTC)</label>
                    <input type="number" step="any" placeholder="0.1" className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" value={amountPerTx} onChange={(e) => setAmountPerTx(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wide mb-1">Interval</label>
                    <select className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors" value={daysInterval} onChange={(e) => setDaysInterval(e.target.value)}>
                      <option value="1">1 Day</option>
                      <option value="3">3 Days</option>
                      <option value="7">7 Days (Weekly)</option>
                      <option value="30">30 Days (Monthly)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-wide mb-1">Max Target Price (zkLTC)</label>
                    <input type="number" step="any" placeholder="e.g. 0.05" className="w-full bg-slate-950/80 border border-blue-900/50 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-semibold transition-colors" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-200 uppercase tracking-wide mb-1">Total Deposit (zkLTC)</label>
                    <input type="number" step="any" placeholder="1.0" className="w-full bg-slate-950/80 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors" value={totalDeposit} onChange={(e) => setTotalDeposit(e.target.value)} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-lg transition-all shadow-md active:scale-[0.98] text-xs tracking-wide uppercase mt-1">
                  {loading ? 'Executing...' : 'Start Automation'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN (TABBED INTERFACE) ================= */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          
          {/* TAB BAR NAVIGATION */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80 shrink-0">
            <button 
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'tokens' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <List size={14} /> Network Tokens
            </button>
            <button 
              onClick={() => setActiveTab('calculator')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'calculator' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Calculator size={14} /> DCA Calculator & Compare
            </button>
          </div>

          {/* TAB PANEL 1: TOKENS LIST */}
          {activeTab === 'tokens' && (
            <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 shadow-xl flex flex-col flex-1 min-h-0 animate-fadeIn">
              <div className="shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"></span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Tokens Found on Network (LiteForge)
                  </h3>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Click the copy icon to fetch the address and auto-fill the form.
                </p>
              </div>
              
              <div className="overflow-y-auto flex-1 min-h-0 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                <table className="w-full text-left border-collapse text-[11px]">
                  <tbody className="divide-y divide-slate-800/30">
                    {TOKENS_LIST.map((token, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-2 font-bold text-blue-400 w-16">{token.symbol}</td>
                        <td className="py-2 text-slate-200 truncate max-w-[100px]">{token.name}</td>
                        <td className="py-2 font-mono text-slate-300 flex items-center gap-1.5 justify-end">
                          <span className="truncate max-w-[120px] sm:max-w-[150px] text-slate-300">{token.address}</span>
                          {!token.isNative && (
                            <button 
                              type="button"
                              onClick={() => copyToClipboard(token.address, idx)} 
                              className="text-slate-400 hover:text-white transition-colors p-0.5 bg-slate-950/40 rounded border border-slate-800/60"
                            >
                              {copiedIndex === idx ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                            </button>
                          )}
                          {token.isNative && <span className="text-[8px] bg-slate-800 text-slate-400 font-sans font-bold px-1 py-0.2 rounded">NATIVE</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB PANEL 2: CALCULATOR & PAIR COMPARISON */}
          {activeTab === 'calculator' && (
            <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 shadow-xl flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 space-y-4 animate-fadeIn">
              
              {/* ASSET PAIR COMPARISON */}
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ArrowRightLeft size={10} className="text-blue-400" /> Asset Pair Blueprint
                </h4>
                <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded border border-slate-800/40 text-xs">
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Deposit Funding</p>
                    <p className="text-sm font-black text-slate-200 mt-0.5">zkLTC</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">Live Price: ${prices.zkLTC}</p>
                  </div>
                  <div className="px-2 text-blue-500 animate-pulse">➔</div>
                  <div className="text-center flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Target Output</p>
                    <p className="text-sm font-black text-blue-400 mt-0.5">{targetTokenSymbol}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                      {prices[targetTokenSymbol] ? `Live Price: $${prices[targetTokenSymbol]}` : 'Address Provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SIMULATION SUMMARY CARDS */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator size={10} className="text-blue-400" /> Strategy Projection
                </h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/40 border border-slate-800 p-2 rounded-lg">
                    <span className="text-slate-400 block tracking-wide text-[9px] uppercase font-semibold">Total Execution Rounds</span>
                    <span className="text-base font-black text-slate-100">{simTotalBuys > 0 ? `${simTotalBuys} purchases` : '---'}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800 p-2 rounded-lg">
                    <span className="text-slate-400 block tracking-wide text-[9px] uppercase font-semibold">Minimum Strategy Lifecycle</span>
                    <span className="text-base font-black text-slate-100">{simTotalDays > 0 ? `~ ${simTotalDays} days` : '---'}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-950/20 to-blue-950/20 border border-emerald-900/40 p-3 rounded-lg flex flex-col justify-between">
                  <span className="text-emerald-400 tracking-wide text-[9px] uppercase font-bold block mb-1">Estimated Accumulation at Target Price</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-emerald-300">
                      {simTokensAcquired > 0 ? simTokensAcquired.toFixed(4) : '0.0000'}
                    </span>
                    <span className="text-xs text-slate-300 font-bold font-mono">{targetTokenSymbol}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                    *Based on execution exactly at your Max Target Price ceiling. Real-world market values below your ceiling will yield even more tokens per round.
                  </p>
                </div>
              </div>

              {/* IMMUTABLE CONTRACT NOTICE */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 shadow-inner mt-auto">
                <h4 className="font-bold text-slate-300 text-[11px] flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Non-Custodial Escrow
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Your funds stay protected inside the automated smart contract until market conditions trigger your parameters or you manually revoke the order.
                </p>
              </div>

            </div>
          )}
        </div>

      </div>
    </main>
  );
}
