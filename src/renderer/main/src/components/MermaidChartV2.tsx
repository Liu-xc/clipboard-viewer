import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartV2Props {
  content: string;
  title?: string;
  className?: string;
  id?: string;
}

const MermaidChartV2: React.FC<MermaidChartV2Props> = ({ content, title, className, id = 'mermaid-chart' }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始化 mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      pie: {
        displayLegend: true,
        legendPosition: 'bottom'
      }
    });

    // 渲染图表
    if (chartRef.current) {
      mermaid.render(id, content).then(({ svg }) => {
        if (chartRef.current) {
          chartRef.current.innerHTML = svg;
        }
      });
    }
  }, [content, id]);

  return (
    <div className={className}>
      {title && <h3>{title}</h3>}
      <div ref={chartRef} />
    </div>
  );
};

export default MermaidChartV2;