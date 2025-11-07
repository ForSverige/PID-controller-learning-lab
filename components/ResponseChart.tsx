import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, Dot, Label } from 'recharts';

interface DataSet {
  t: number[];
  temp: number[];
  setpoint: number[];
  name: string;
  isHighlighted?: boolean;
}

interface ResponseChartProps {
  dataSets: DataSet[];
  title: string;
  yLabel: string;
  yDomain: [number, number];
  subtitle?: string;
  demoText?: string;
  showToleranceBand?: boolean;
  showAnnotations?: { overshoot: boolean; finalError: boolean };
}

const COLORS = ['#2E86AB', '#E53935', '#43A047', '#FB8C00', '#6A1B9A'];
const HIGHLIGHT_COLORS = ['#00C853', '#d50000'];

const ResponseChart: React.FC<ResponseChartProps> = ({ dataSets, title, yLabel, yDomain, subtitle, demoText, showToleranceBand = false, showAnnotations }) => {
  if (!dataSets || dataSets.length === 0 || dataSets[0].t.length === 0) {
    return <div className="text-center p-4">Loading chart data...</div>;
  }
  
  const chartData = dataSets[0].t.map((time, i) => {
    // FIX: Correctly type dataPoint values as numbers, as they are all numeric.
    const dataPoint: { [key: string]: number } = { t: time };
    dataSets.forEach((ds, index) => {
      dataPoint[ds.name] = ds.temp[i];
    });
    if (dataSets[0].setpoint) {
       dataPoint['Target'] = dataSets[0].setpoint[i];
    }
    return dataPoint;
  });

  const getAnnotations = () => {
    if (!showAnnotations || !dataSets[0]) return [];

    const dataSet = dataSets[0];
    const annotations = [];

    // Overshoot
    if (showAnnotations.overshoot) {
        let maxOvershoot = -Infinity;
        let maxOvershootIndex = -1;

        dataSet.temp.forEach((temp, i) => {
            const overshoot = temp - dataSet.setpoint[i];
            if (overshoot > maxOvershoot) {
                maxOvershoot = overshoot;
                maxOvershootIndex = i;
            }
        });

        if (maxOvershoot > 0.3 && maxOvershootIndex !== -1) {
            annotations.push({
                x: dataSet.t[maxOvershootIndex],
                y: dataSet.temp[maxOvershootIndex],
                label: `Overshoot\n+${maxOvershoot.toFixed(1)}°C`,
                color: '#E53935'
            });
        }
    }

    // Final Error
    if (showAnnotations.finalError) {
        const lastIndex = dataSet.t.length - 1;
        const finalTemp = dataSet.temp[lastIndex];
        const finalSetpoint = dataSet.setpoint[lastIndex];
        const finalError = finalTemp - finalSetpoint;
        annotations.push({
            x: dataSet.t[lastIndex],
            y: finalTemp,
            label: `Final Error\n${finalError.toFixed(2)}°C`,
            color: Math.abs(finalError) < 0.5 ? '#43A047' : '#FB8C00'
        });
    }
    return annotations;
  };
  const annotations = getAnnotations();

  const CustomDot: React.FC<any> = (props) => {
    const { cx, cy, payload, dataKey } = props;
    const annotation = annotations.find(a => a.x === payload.t && a.y === payload[dataKey]);
  
    if (annotation) {
      return (
        <g>
          <Dot {...props} r={5} fill={annotation.color} stroke="white" strokeWidth={2} />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 sm:h-96 flex flex-col">
      <h3 className="text-center font-bold text-sm sm:text-base text-slate-700">{title}</h3>
      {subtitle && <p className="text-center text-xs text-slate-500 -mt-1">{subtitle}</p>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 30, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="t" type="number" domain={[0, 'dataMax']} tick={{ fontSize: 10 }}>
            <Label value="Time (s)" offset={-15} position="insideBottom" style={{ fontSize: '12px', fontWeight: 'bold' }} />
          </XAxis>
          <YAxis domain={yDomain} tick={{ fontSize: 10 }} tickFormatter={(tick) => (tick as number).toFixed(0)}>
             <Label value={yLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold' }} offset={-20}/>
          </YAxis>
          <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}/>
          <Legend wrapperStyle={{ fontSize: '11px', bottom: 0 }} />
          
          {showToleranceBand && dataSets[0].setpoint && (
             <ReferenceArea y1={-0.5} y2={0.5} strokeOpacity={0.3} fill="green" fillOpacity={0.1} 
                shape={(props) => {
                    const { viewBox } = props;
                    if (!viewBox) {
                        return null;
                    }
                    const { x, y, width, height } = viewBox;
                    
                    const points = chartData.map(p => ({
                        x: x + (p.t / dataSets[0].t[dataSets[0].t.length - 1]) * width,
                        y1: y + height - ( (p.Target + 0.5 - yDomain[0]) / (yDomain[1] - yDomain[0]) ) * height,
                        y2: y + height - ( (p.Target - 0.5 - yDomain[0]) / (yDomain[1] - yDomain[0]) ) * height,
                    }));

                    const path = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x},${p.y2}`).join(' ') + 
                                 [...points].reverse().map((p) => `L${p.x},${p.y1}`).join(' ') + 'Z';
                    return <path d={path} fill="green" fillOpacity={0.1} />;
                }}
             />
          )}

          {dataSets[0].setpoint && <Line type="monotone" dataKey="Target" stroke="#1E88E5" strokeWidth={2} strokeDasharray="5 5" dot={false} name="🎯 Target" />}
          
          {dataSets.map((ds, index) => (
             <Line
                key={ds.name}
                type="monotone"
                dataKey={ds.name}
                stroke={dataSets.length > 1 ? COLORS[index % COLORS.length] : (ds.name.includes("PID") ? HIGHLIGHT_COLORS[0] : HIGHLIGHT_COLORS[1])}
                strokeWidth={ds.isHighlighted ? 3 : 2}
                strokeOpacity={ds.isHighlighted ? 1 : 0.7}
                dot={showAnnotations ? <CustomDot /> : false}
              />
          ))}

          {annotations.map(a => (
            <foreignObject key={a.label} x={0} y={0} width="100%" height="100%" style={{pointerEvents: 'none'}}>
                {/* This is a hacky way to place HTML labels on recharts */}
            </foreignObject>
          ))}

          {demoText && <Label value={demoText} position="insideTopLeft" offset={10} style={{ fontSize: '10px', fill: '#777' }} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseChart;