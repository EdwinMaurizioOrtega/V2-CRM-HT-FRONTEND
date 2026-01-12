import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

export default function D3BarChart({ data, xKey, yKey, height = 400, color = '#1976d2', horizontal = false }) {
    const svgRef = useRef();
    const containerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const container = containerRef.current;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 30, bottom: horizontal ? 60 : 120, left: horizontal ? 150 : 60 };
        const width = container.offsetWidth - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Fondo con grid sutil
        const gridGroup = g.append('g').attr('class', 'grid');
        
        if (horizontal) {
            // Grid horizontal
            gridGroup.selectAll('.grid-line')
                .data(d3.range(0, d3.max(data, d => d[yKey]) || 0, (d3.max(data, d => d[yKey]) || 100) / 10))
                .enter()
                .append('line')
                .attr('class', 'grid-line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', (d, i) => i * (chartHeight / 10))
                .attr('y2', (d, i) => i * (chartHeight / 10))
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 0.5)
                .attr('stroke-dasharray', '2,2')
                .attr('opacity', 0)
                .transition()
                .duration(800)
                .attr('opacity', 0.3);
        }

        if (horizontal) {
            // Gráfico horizontal
            const x = d3.scaleLinear()
                .domain([0, d3.max(data, d => d[yKey]) || 0])
                .range([0, width]);

            const y = d3.scaleBand()
                .domain(data.map(d => d[xKey]))
                .range([0, chartHeight])
                .padding(0.2);

            // Definir gradiente
            const defs = svg.append('defs');
            const gradient = defs.append('linearGradient')
                .attr('id', `bar-gradient-${Math.random()}`)
                .attr('x1', '0%')
                .attr('x2', '100%');
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', color)
                .attr('stop-opacity', 1);
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', color)
                .attr('stop-opacity', 0.7);

            // Barras con sombra
            g.selectAll('.bar-shadow')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar-shadow')
                .attr('y', d => y(d[xKey]) + 3)
                .attr('x', 3)
                .attr('height', y.bandwidth())
                .attr('width', 0)
                .attr('fill', '#000')
                .attr('opacity', 0.1)
                .attr('rx', 6)
                .transition()
                .duration(800)
                .attr('width', d => x(d[yKey]));

            // Barras
            g.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('y', d => y(d[xKey]))
                .attr('x', 0)
                .attr('height', y.bandwidth())
                .attr('width', 0)
                .attr('fill', `url(#bar-gradient-${Math.random()})`)
                .attr('rx', 6)
                .attr('opacity', 0.9)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .attr('opacity', 1)
                        .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))');
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .attr('opacity', 0.9)
                        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
                })
                .transition()
                .duration(800)
                .ease(d3.easeCubicOut)
                .attr('width', d => x(d[yKey]));

            // Eje Y
            g.append('g')
                .call(d3.axisLeft(y))
                .selectAll('text')
                .style('font-size', '13px')
                .style('font-weight', '500');

            // Eje X
            g.append('g')
                .attr('transform', `translate(0,${chartHeight})`)
                .call(d3.axisBottom(x).ticks(5))
                .selectAll('text')
                .style('font-size', '13px');

            // Etiquetas de valores con animación
            g.selectAll('.label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', 5)
                .attr('y', d => y(d[xKey]) + y.bandwidth() / 2)
                .attr('dy', '0.35em')
                .style('font-size', '14px')
                .style('font-weight', '700')
                .style('fill', '#1a1a1a')
                .style('opacity', 0)
                .transition()
                .delay((d, i) => i * 50)
                .duration(800)
                .attr('x', d => x(d[yKey]) + 5)
                .style('opacity', 1)
                .text(d => d[yKey].toLocaleString());

            // Tooltips elegantes
            const tooltip = g.append('g')
                .attr('class', 'tooltip-group')
                .style('display', 'none');

            tooltip.append('rect')
                .attr('class', 'tooltip-bg')
                .attr('rx', 8)
                .attr('fill', 'rgba(0, 0, 0, 0.9)')
                .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))');

            tooltip.append('text')
                .attr('class', 'tooltip-label')
                .attr('fill', 'white')
                .attr('font-size', '12px')
                .attr('font-weight', '600')
                .attr('dy', '-1.2em');

            tooltip.append('text')
                .attr('class', 'tooltip-value')
                .attr('fill', '#4caf50')
                .attr('font-size', '18px')
                .attr('font-weight', '700')
                .attr('dy', '0.3em');

            g.selectAll('.bar').on('mouseover', function(event, d) {
                const bar = d3.select(this);
                bar.attr('opacity', 1)
                    .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))');
                
                const [mx, my] = d3.pointer(event, g.node());
                tooltip.style('display', 'block')
                    .attr('transform', `translate(${mx + 10}, ${my - 10})`);
                
                tooltip.select('.tooltip-label').text(d[xKey]);
                tooltip.select('.tooltip-value').text(d[yKey].toLocaleString());
                
                const bbox = tooltip.node().getBBox();
                tooltip.select('.tooltip-bg')
                    .attr('x', bbox.x - 10)
                    .attr('y', bbox.y - 10)
                    .attr('width', bbox.width + 20)
                    .attr('height', bbox.height + 20);
            }).on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.9)
                    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
                tooltip.style('display', 'none');
            });

        } else {
            // Grid vertical
            gridGroup.selectAll('.grid-line')
                .data(d3.range(0, d3.max(data, d => d[yKey]) || 0, (d3.max(data, d => d[yKey]) || 100) / 10))
                .enter()
                .append('line')
                .attr('class', 'grid-line')
                .attr('x1', 0)
                .attr('x2', width)
                .attr('y1', d => chartHeight - (d / (d3.max(data, dd => dd[yKey]) || 1) * chartHeight))
                .attr('y2', d => chartHeight - (d / (d3.max(data, dd => dd[yKey]) || 1) * chartHeight))
                .attr('stroke', '#e0e0e0')
                .attr('stroke-width', 0.5)
                .attr('stroke-dasharray', '2,2')
                .attr('opacity', 0)
                .transition()
                .duration(800)
                .attr('opacity', 0.3);

            // Gráfico vertical
            const x = d3.scaleBand()
                .domain(data.map(d => d[xKey]))
                .range([0, width])
                .padding(0.2);

            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d[yKey]) || 0])
                .range([chartHeight, 0]);

            // Definir gradiente vertical
            const defs = svg.append('defs');
            const gradient = defs.append('linearGradient')
                .attr('id', `bar-gradient-v-${Math.random()}`)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', color)
                .attr('stop-opacity', 1);
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', color)
                .attr('stop-opacity', 0.6);

            // Sombras
            g.selectAll('.bar-shadow')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar-shadow')
                .attr('x', d => x(d[xKey]) + 3)
                .attr('y', chartHeight)
                .attr('width', x.bandwidth())
                .attr('height', 0)
                .attr('fill', '#000')
                .attr('opacity', 0.1)
                .attr('rx', 6)
                .transition()
                .duration(800)
                .attr('y', d => y(d[yKey]) + 3)
                .attr('height', d => chartHeight - y(d[yKey]));

            // Barras
            g.selectAll('.bar')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d[xKey]))
                .attr('y', chartHeight)
                .attr('width', x.bandwidth())
                .attr('height', 0)
                .attr('fill', `url(#bar-gradient-v-${Math.random()})`)
                .attr('rx', 6)
                .attr('opacity', 0.9)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))')
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .attr('opacity', 1)
                        .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))');
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .attr('opacity', 0.9)
                        .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
                })
                .transition()
                .duration(800)
                .ease(d3.easeCubicOut)
                .attr('y', d => y(d[yKey]))
                .attr('height', d => chartHeight - y(d[yKey]));

            // Eje X
            g.append('g')
                .attr('transform', `translate(0,${chartHeight})`)
                .call(d3.axisBottom(x))
                .selectAll('text')
                .style('text-anchor', 'end')
                .style('font-size', '13px')
                .style('font-weight', '500')
                .attr('dx', '-.8em')
                .attr('dy', '.15em')
                .attr('transform', 'rotate(-45)');

            // Eje Y
            g.append('g')
                .call(d3.axisLeft(y).ticks(5))
                .selectAll('text')
                .style('font-size', '13px');

            // Etiquetas de valores con animación
            g.selectAll('.label')
                .data(data)
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', d => x(d[xKey]) + x.bandwidth() / 2)
                .attr('y', chartHeight)
                .attr('text-anchor', 'middle')
                .style('font-size', '14px')
                .style('font-weight', '700')
                .style('fill', '#1a1a1a')
                .style('opacity', 0)
                .transition()
                .delay((d, i) => i * 50)
                .duration(800)
                .attr('y', d => y(d[yKey]) - 5)
                .style('opacity', 1)
                .text(d => d[yKey].toLocaleString());

            // Tooltips elegantes
            const tooltip = g.append('g')
                .attr('class', 'tooltip-group')
                .style('display', 'none');

            tooltip.append('rect')
                .attr('class', 'tooltip-bg')
                .attr('rx', 8)
                .attr('fill', 'rgba(0, 0, 0, 0.9)')
                .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))');

            tooltip.append('text')
                .attr('class', 'tooltip-label')
                .attr('fill', 'white')
                .attr('font-size', '12px')
                .attr('font-weight', '600')
                .attr('dy', '-1.2em');

            tooltip.append('text')
                .attr('class', 'tooltip-value')
                .attr('fill', '#4caf50')
                .attr('font-size', '18px')
                .attr('font-weight', '700')
                .attr('dy', '0.3em');

            g.selectAll('.bar').on('mouseover', function(event, d) {
                const bar = d3.select(this);
                bar.attr('opacity', 1)
                    .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))');
                
                const [mx, my] = d3.pointer(event, g.node());
                tooltip.style('display', 'block')
                    .attr('transform', `translate(${mx + 10}, ${my - 10})`);
                
                tooltip.select('.tooltip-label').text(d[xKey]);
                tooltip.select('.tooltip-value').text(d[yKey].toLocaleString());
                
                const bbox = tooltip.node().getBBox();
                tooltip.select('.tooltip-bg')
                    .attr('x', bbox.x - 10)
                    .attr('y', bbox.y - 10)
                    .attr('width', bbox.width + 20)
                    .attr('height', bbox.height + 20);
            }).on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.9)
                    .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))');
                tooltip.style('display', 'none');
            });
        }

        // Zoom y Pan
        const zoom = d3.zoom()
            .scaleExtent([1, 5])
            .translateExtent([[0, 0], [width, chartHeight]])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Botones de zoom
        const toolbar = d3.select(container)
            .select('.d3-toolbar');

        toolbar.selectAll('*').remove();

        const zoomIn = toolbar.append('button')
            .style('margin', '0 5px')
            .style('padding', '5px 10px')
            .style('cursor', 'pointer')
            .text('Zoom In')
            .on('click', () => {
                svg.transition().call(zoom.scaleBy, 1.3);
            });

        const zoomOut = toolbar.append('button')
            .style('margin', '0 5px')
            .style('padding', '5px 10px')
            .style('cursor', 'pointer')
            .text('Zoom Out')
            .on('click', () => {
                svg.transition().call(zoom.scaleBy, 0.7);
            });

        const reset = toolbar.append('button')
            .style('margin', '0 5px')
            .style('padding', '5px 10px')
            .style('cursor', 'pointer')
            .text('Reset')
            .on('click', () => {
                svg.transition().call(zoom.transform, d3.zoomIdentity);
            });

    }, [data, xKey, yKey, height, color, horizontal]);

    return (
        <Box ref={containerRef} sx={{ width: '100%', position: 'relative' }}>
            <Box className="d3-toolbar" sx={{ mb: 1, textAlign: 'right' }} />
            <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
        </Box>
    );
}
