
import React, { useState, useMemo } from 'react';
import { simulateSystem } from '../services/simulation';
import { SetpointProfile } from '../types';
import Slider from './Slider';
import ResponseChart from './ResponseChart';
import MetricCard from './MetricCard';
import { AlertIcon } from './Icons';

type CompareMode = 'P' | 'I' | 'D';
type Challenge = 'Constant' | 'Changing' | 'Multi-step';

const LearnTab: React.FC = () => {
    const [kp, setKp] = useState(0.0);
    const [ki, setKi] = useState(0.0);
    const [kd, setKd] = useState(0.0);
    const [compareMode, setCompareMode] = useState<CompareMode>('P');
    const [challenge, setChallenge] = useState<Challenge>('Constant');

    const { setpointFunc, duration, initialTemp } = useMemo(() => {
        const initial = 18.0;
        const dur = 50;
        let func: SetpointProfile;
        switch (challenge) {
            case 'Changing':
                func = (t: number) => (t < 25 ? 22.0 : 24.0);
                break;
            case 'Multi-step':
                func = (t: number) => {
                    if (t < 15) return 22.0;
                    if (t < 30) return 25.0;
                    return 21.0;
                };
                break;
            case 'Constant':
            default:
                func = (_: number) => 22.0;
                break;
        }
        return { setpointFunc: func, duration: dur, initialTemp: initial };
    }, [challenge]);

    const { currentSim, compareSims, metrics, hints } = useMemo(() => {
        const currentData = simulateSystem(kp, ki, kd, setpointFunc, initialTemp, duration);
        
        let compareSimsData = [];
        let compareTitle = '';
        let demoText = '';

        switch (compareMode) {
            case 'P':
                compareTitle = "💡 P controls speed & initial overshoot";
                const pValues = [1.0, 2.5, 4.5, 7.0];
                compareSimsData = pValues.map(val => ({
                    ...simulateSystem(val, ki, kd, setpointFunc, initialTemp, duration),
                    name: `Kp=${val}`,
                    isHighlighted: Math.abs(val - kp) < 0.3,
                }));
                break;
            case 'I':
                compareTitle = "💡 I removes steady-state error (offset from target)";
                const iValues = [0.0, 0.3, 0.8, 1.5];
                const demoKpI = 3.0;
                demoText = `Demo: Kp=${demoKpI}, Kd=${kd.toFixed(1)}`;
                compareSimsData = iValues.map(val => ({
                    ...simulateSystem(demoKpI, val, kd, setpointFunc, initialTemp, duration),
                    name: `Ki=${val}`,
                    isHighlighted: Math.abs(val - ki) < 0.05,
                }));
                break;
            case 'D':
                 compareTitle = "💡 D dampens oscillations & reduces overshoot";
                const dValues = [0.0, 2.0, 4.5, 7.0];
                const demoKpD = 6.0;
                const demoKiD = 0.8;
                demoText = `Demo: Kp=${demoKpD}, Ki=${demoKiD}`;
                compareSimsData = dValues.map(val => ({
                    ...simulateSystem(demoKpD, demoKiD, val, setpointFunc, initialTemp, duration),
                    name: `Kd=${val}`,
                    isHighlighted: Math.abs(val - kd) < 0.3,
                }));
                break;
        }

        // Performance Metrics Calculation
        let maxOvershoot = 0;
        currentData.t.forEach((time, i) => {
            const sp = setpointFunc(time);
            const overshootAtT = currentData.temp[i] - sp;
            if (overshootAtT > maxOvershoot) {
                maxOvershoot = overshootAtT;
            }
        });
        
        const finalSp = setpointFunc(currentData.t[currentData.t.length - 1]);
        const finalError = Math.abs(currentData.temp[currentData.temp.length - 1] - finalSp);

        const tempDiff = currentData.temp.slice(1).map((v, i) => v - currentData.temp[i]);
        const signChanges = tempDiff.slice(1).map((v, i) => Math.sign(v) - Math.sign(tempDiff[i])).filter(v => v !== 0);
        const oscillations = Math.floor(signChanges.length / 2);

        const tolerance = 0.5;
        const settledIndex = currentData.temp.findIndex(temp => Math.abs(temp - finalSp) < tolerance);
        const settlingTime = settledIndex !== -1 ? currentData.t[settledIndex] : duration;
        
        const calculatedMetrics = {
            settlingTime,
            maxOvershoot,
            finalError,
            oscillations,
        };
        
        // Smart Hints
        const newHints = [];
        if (kp === 0) newHints.push("🚀 Start with P! Try Kp=3.0");
        else if (kp < 2.0) newHints.push("🐌 Increase P for faster response");
        if (finalError > 1.0 && ki < 0.2) newHints.push("📍 Add I (Ki~0.5) to eliminate error");
        if (maxOvershoot > 2.0 && kd < 1.0) newHints.push("🎢 Add D (Kd~3.0) to reduce overshoot");
        if (oscillations > 10 && kd < 2.0) newHints.push("〰️ Too many oscillations! Increase D");

        return {
            currentSim: { ...currentData, name: 'Your PID' },
            compareSims: { sims: compareSimsData, title: compareTitle, demoText },
            metrics: calculatedMetrics,
            hints: newHints
        };
    }, [kp, ki, kd, setpointFunc, initialTemp, duration, compareMode]);

    const maxTemp = Math.max(...currentSim.setpoint) + 6;
    const minYlim = initialTemp - 2;

    const success = hints.length === 0 && kp > 0 && ki > 0 && kd > 0 && metrics.finalError < 0.5 && metrics.maxOvershoot < 2.0;

    return (
        <div>
            <div className="text-center mb-4">
                <p><b>🎯 Progressive Learning:</b> Build P → P+I → P+I+D to handle challenges!</p>
                <div className="bg-blue-100 p-3 rounded-lg border-l-4 border-brand-blue my-4 max-w-lg mx-auto text-sm">
                    <b>📐 PID Formula:</b>&nbsp;&nbsp;
                    <code>u(t) = <span className="text-brand-red font-semibold">K<sub>p</sub>·e(t)</span> + <span className="text-brand-green font-semibold">K<sub>i</sub>·∫e(τ)dτ</span> + <span className="text-brand-orange font-semibold">K<sub>d</sub>·de(t)/dt</span></code>
                    <br/><small>where <b>e(t)</b> = setpoint - measured value | <b>u(t)</b> = control output</small>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg shadow-inner border">
                    <Slider label="Kp - Response Speed" value={kp} setValue={setKp} min={0} max={8} step={0.1} color="red" help="Proportional: Reacts to current error."/>
                    <Slider label="Ki - Eliminates Error" value={ki} setValue={setKi} min={0} max={2} step={0.05} color="green" help="Integral: Accumulates error over time."/>
                    <Slider label="Kd - Stops Oscillations" value={kd} setValue={setKd} min={0} max={8} step={0.1} color="orange" help="Derivative: Predicts future error."/>
                    
                    <div className="mt-4">
                        <label className="font-bold text-sm text-slate-600 block mb-2">🔍 Compare:</label>
                        <div className="flex bg-slate-200 rounded-lg p-1">
                            {(['P', 'I', 'D'] as CompareMode[]).map(mode => (
                                <button key={mode} onClick={() => setCompareMode(mode)} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-all ${compareMode === mode ? 'bg-white text-blue-600 shadow' : 'text-slate-700'}`}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-4">
                         <label htmlFor="challenge" className="font-bold text-sm text-slate-600 block mb-2">🎯 Challenge:</label>
                        <select id="challenge" value={challenge} onChange={e => setChallenge(e.target.value as Challenge)} className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="Constant">Easy: Constant target</option>
                            <option value="Changing">Hard: Changing target</option>
                            <option value="Multi-step">Expert: Multi-step</option>
                        </select>
                    </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-2 rounded-lg shadow-inner border">
                        <ResponseChart 
                            dataSets={compareSims.sims} 
                            title={`📊 Compare ${compareMode} Values`} 
                            yLabel="Temperature (°C)" 
                            yDomain={[minYlim, maxTemp]} 
                            subtitle={compareSims.title}
                            demoText={compareSims.demoText}
                        />
                   </div>
                    <div className="bg-slate-50 p-2 rounded-lg shadow-inner border">
                         <ResponseChart 
                            dataSets={[currentSim]} 
                            title={`🎮 Your PID: Kp=${kp.toFixed(1)} | Ki=${ki.toFixed(1)} | Kd=${kd.toFixed(1)}`} 
                            yLabel="Temperature (°C)" 
                            yDomain={[minYlim, maxTemp]}
                            showToleranceBand={true}
                            showAnnotations={{overshoot: true, finalError: true}}
                         />
                    </div>
                </div>
            </div>
            
            <div className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard title="⏱️ Settling Time" value={`${metrics.settlingTime.toFixed(1)}s`} />
                    <MetricCard title="📈 Max Overshoot" value={`${metrics.maxOvershoot.toFixed(2)}°C`} />
                    <MetricCard title="🎯 Final Error" value={`${metrics.finalError.toFixed(2)}°C`} />
                    <MetricCard title="〰️ Oscillations" value={metrics.oscillations.toString()} />
                </div>
            </div>

            <div className="mt-6">
                {hints.length > 0 && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg" role="alert">
                        <p className="font-bold flex items-center gap-2"><AlertIcon /> Smart Hints</p>
                        <p>{hints.join(' | ')}</p>
                    </div>
                )}
                 {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg" role="alert">
                        <p className="font-bold">🎉 Excellent PID!</p>
                        <p>All three terms working together. Try the Tuning Challenge in the next tab!</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default LearnTab;
