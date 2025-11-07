import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';

interface DataSet {
  t: number[];
  control: number[];
  name: string;
}

interface ControlChartProps {
  dataSets: DataSet[];
  title: string;
  yLabel: string;
  yDomain: [number, number];
}

const COLORS = ['#00C853', '#d50000'];

const ControlChart: React.FC<ControlChartProps> = ({ dataSets, title, yLabel, yDomain }) => {
    if (!dataSets || dataSets.length === 0) return null;
    
    const chartData = dataSets[0].t.map((time, i) => {
        const dataPoint: { [key: string]: number | string } = { t: time };
        dataSets.forEach((ds) => {
          dataPoint[ds.name] = ds.control[i];
        });
        return dataPoint;
    });

    return (
        <div className="w-full h-80 sm:h-96 flex flex-col">
            <h3 className="text-center font-bold text-sm sm:text-base text-slate-700">{title}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 30, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                    <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} tick={{ fontSize: 10 }}>
                        <Label value="Time (s)" offset={-15} position="insideBottom" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </XAxis>
                    <YAxis domain={yDomain} tick={{ fontSize: 10 }} tickFormatter={(tick) => (tick as number).toFixed(0)}>
                        <Label value={yLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold' }} offset={-20} />
                    </YAxis>
                    <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}/>
                    <Legend wrapperStyle={{ fontSize: '11px', bottom: 0 }}/>
                    {dataSets.map((ds, index) => (
                        <Area
                            key={ds.name}
                            type="monotone"
                            dataKey={ds.name}
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            strokeWidth={2}
                            fillOpacity={0.2}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ControlChart;