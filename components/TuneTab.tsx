
import React, { useState, useMemo } from 'react';
import { simulateSystem, simulateBaseline } from '../services/simulation';
import { SetpointProfile } from '../types';
import Slider from './Slider';
import ResponseChart from './ResponseChart';
import ControlChart from './ControlChart';
import MetricCard from './MetricCard';

type Scenario = 'Single Step' | 'Double Step' | 'Triple Step';

const TuneTab: React.FC = () => {
    const [kp, setKp] = useState(2.0);
    const [ki, setKi] = useState(0.15);
    const [kd, setKd] = useState(0.0);
    const [scenario, setScenario] = useState<Scenario>('Single Step');

    const { setpointFunc, duration, initialTemp } = useMemo(() => {
        const initial = 18.0;
        let dur: number;
        let func: SetpointProfile;

        switch (scenario) {
            case 'Double Step':
                dur = 40;
                func = (t: number) => (t < 20 ? 22.0 : 25.0);
                break;
            case 'Triple Step':
                dur = 50;
                func = (t: number) => {
                    if (t < 15) return 22.0;
                    if (t < 32) return 25.0;
                    return 20.0;
                };
                break;
            case 'Single Step':
            default:
                dur = 30;
                func = (_: number) => 22.0;
                break;
        }
        return { setpointFunc: func, duration: dur, initialTemp: initial };
    }, [scenario]);

    const { pidSim, baseSim, metrics } = useMemo(() => {
        const pidData = simulateSystem(kp, ki, kd, setpointFunc, initialTemp, duration);
        const baseData = simulateBaseline(setpointFunc, initialTemp, duration);

        const mae_pid = pidData.error.reduce((acc, err) => acc + Math.abs(err), 0) / pidData.error.length;
        const base_error = baseData.temp.map((temp, i) => temp - baseData.setpoint[i]);
        const mae_base = base_error.reduce((acc, err) => acc + Math.abs(err), 0) / base_error.length;

        const max_overshoot_pid = Math.max(0, ...pidData.temp.map((temp, i) => temp - pidData.setpoint[i]));
        const max_overshoot_base = Math.max(0, ...baseData.temp.map((temp, i) => temp - baseData.setpoint[i]));
        
        const tv_pid = pidData.control.slice(1).reduce((acc, u, i) => acc + Math.abs(u - pidData.control[i]), 0);
        const tv_base = baseData.control.slice(1).reduce((acc, u, i) => acc + Math.abs(u - baseData.control[i]), 0);

        return {
            pidSim: { ...pidData, name: '✅ Your PID' },
            baseSim: { ...baseData, name: '❌ Baseline' },
            metrics: {
                mae: { pid: mae_pid, base: mae_base },
                overshoot: { pid: max_overshoot_pid, base: max_overshoot_base },
                smoothness: { pid: tv_pid, base: tv_base },
            }
        };
    }, [kp, ki, kd, setpointFunc, initialTemp, duration]);
    
    const maxTemp = Math.max(...pidSim.setpoint, ...baseSim.temp) + 2;
    const minYlim = initialTemp - 2;

    const errorWin = metrics.mae.pid < metrics.mae.base;
    const overshootWin = metrics.overshoot.pid < metrics.overshoot.base;
    const smoothWin = metrics.smoothness.pid < metrics.smoothness.base;
    const wins = [errorWin, overshootWin, smoothWin].filter(Boolean).length;
    
    let overallMessage;
    if (wins === 3) {
      overallMessage = <div className="bg-green-100 border-green-500 text-green-700 border-l-4 p-4 mt-4 rounded-r-lg"><p className="font-bold">🏆 PERFECT!</p><p>You beat baseline on ALL metrics! Expert-level tuning!</p></div>;
    } else if (wins === 2) {
      overallMessage = <div className="bg-blue-100 border-blue-500 text-blue-700 border-l-4 p-4 mt-4 rounded-r-lg"><p className="font-bold">🎉 GREAT!</p><p>2/3 metrics better. Fine-tune for perfection!</p></div>;
    } else if (wins === 1) {
      overallMessage = <div className="bg-yellow-100 border-yellow-500 text-yellow-700 border-l-4 p-4 mt-4 rounded-r-lg"><p className="font-bold">⚠️ GOOD START!</p><p>1/3 metrics improved. Keep adjusting!</p></div>;
    } else {
      overallMessage = <div className="bg-red-100 border-red-500 text-red-700 border-l-4 p-4 mt-4 rounded-r-lg"><p className="font-bold">❌ NEEDS WORK</p><p>Try: Increase P for speed, add I for accuracy, add D for smoothness.</p></div>;
    }


    return (
        <div>
            <p className="text-center mb-4"><b>🎯 Beat the baseline!</b> Optimize for <b>low error + low overshoot + smooth control</b></p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg shadow-inner border">
                    <Slider label="Kp" value={kp} setValue={setKp} min={0} max={8} step={0.1} color="red" />
                    <Slider label="Ki" value={ki} setValue={setKi} min={0} max={2} step={0.05} color="green" />
                    <Slider label="Kd" value={kd} setValue={setKd} min={0} max={8} step={0.1} color="orange" />
                     <div className="mt-4">
                         <label htmlFor="scenario" className="font-bold text-sm text-slate-600 block mb-2">Test Scenario:</label>
                        <select id="scenario" value={scenario} onChange={e => setScenario(e.target.value as Scenario)} className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="Single Step">Single Step: 18→22°C</option>
                            <option value="Double Step">Double Step: 18→22→25°C</option>
                            <option value="Triple Step">Triple Step: 18→22→25→20°C</option>
                        </select>
                    </div>
                     <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <p className="font-bold text-blue-800">Baseline Controller</p>
                        <p className="text-blue-700">A simple "bang-bang" controller with a ±1.5°C deadband. It's functional but inefficient.</p>
                    </div>
                </div>
                 <div className="lg:col-span-2 grid grid-cols-1 xl:grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-2 rounded-lg shadow-inner border">
                        <ResponseChart 
                            dataSets={[pidSim, baseSim]} 
                            title="🌡️ Temperature Tracking" 
                            yLabel="Temperature (°C)" 
                            yDomain={[minYlim, maxTemp]}
                            showToleranceBand={true}
                        />
                   </div>
                    <div className="bg-slate-50 p-2 rounded-lg shadow-inner border">
                         <ControlChart 
                            dataSets={[pidSim, baseSim]} 
                            title="⚡ Control Effort" 
                            yLabel="Control Signal" 
                            yDomain={[-110, 110]}
                         />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-bold text-center mb-3">🏆 Scorecard vs. Baseline</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard 
                        title="🎯 Avg Error" 
                        value={`${metrics.mae.pid.toFixed(2)}°C`}
                        delta={((metrics.mae.base - metrics.mae.pid) / metrics.mae.base) * 100}
                        deltaType="percent"
                        isInverse
                    />
                     <MetricCard 
                        title="📈 Max Overshoot" 
                        value={`${metrics.overshoot.pid.toFixed(2)}°C`}
                        delta={metrics.overshoot.base - metrics.overshoot.pid}
                        deltaType="absolute"
                        isInverse
                        unit="°C"
                    />
                     <MetricCard 
                        title="〰️ Smoothness" 
                        value={`${metrics.smoothness.pid.toFixed(0)}`}
                        delta={((metrics.smoothness.base - metrics.smoothness.pid) / metrics.smoothness.base) * 100}
                        deltaType="percent"
                        isInverse
                    />
                </div>
                {overallMessage}
            </div>
        </div>
    );
};

export default TuneTab;
