import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

export default function D3ScatterPlot({ data, xKey, yKey, labelKey, sizeKey, height = 400, color = '#1976d2' }) {
    const svgRef = useRef();
    const containerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const container = containerRef.current;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 30, bottom: 60, left: 80 };
        const width = container.offsetWidth - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Grid de fondo
        const gridGroup = g.append('g').attr('class', 'grid').style('opacity', 0);
        
        // Grid horizontal
        gridGroup.append('g')
            .selectAll('line')
            .data(d3.range(6))
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1', (d, i) => (chartHeight / 5) * i)
            .attr('y2', (d, i) => (chartHeight / 5) * i)
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

        // Grid vertical
        gridGroup.append('g')
            .selectAll('line')
            .data(d3.range(6))
            .enter()
            .append('line')
            .attr('x1', (d, i) => (width / 5) * i)
            .attr('x2', (d, i) => (width / 5) * i)
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('stroke', '#e0e0e0')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

        gridGroup.transition().duration(800).style('opacity', 1);

        // Escalas
        const x = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[xKey]) || 0])
            .range([0, width])
            .nice();

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[yKey]) || 0])
            .range([chartHeight, 0])
            .nice();

        const size = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d[sizeKey]) || 0])
            .range([5, 30]);

        // Definir filtro de glow
        const defs = svg.append('defs');
        const filter = defs.append('filter')
            .attr('id', 'glow');
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'coloredBlur');
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Puntos
        g.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', width / 2)
            .attr('cy', chartHeight / 2)
            .attr('r', 0)
            .attr('fill', color)
            .attr('opacity', 0.7)
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke-width', 4)
                    .style('filter', 'url(#glow)');

                // Tooltip premium
                const tooltip = g.append('g')
                    .attr('class', 'tooltip')
                    .attr('transform', `translate(${x(d[xKey])},${y(d[yKey]) - size(d[sizeKey]) - 10})`);

                const text = [
                    d[labelKey],
                    `${xKey}: ${d[xKey].toLocaleString()}`,
                    `${yKey}: ${d[yKey].toLocaleString()}`,
                    `${sizeKey}: ${d[sizeKey].toLocaleString()}`
                ];

                // Sombra del tooltip
                tooltip.append('rect')
                    .attr('x', -82)
                    .attr('y', -72)
                    .attr('width', 164)
                    .attr('height', 69)
                    .attr('fill', '#000')
                    .attr('opacity', 0.15)
                    .attr('rx', 10)
                    .attr('filter', 'blur(4px)');

                // Fondo del tooltip
                tooltip.append('rect')
                    .attr('x', -80)
                    .attr('y', -70)
                    .attr('width', 160)
                    .attr('height', 65)
                    .attr('fill', 'rgba(0, 0, 0, 0.95)')
                    .attr('rx', 8)
                    .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))');

                // Borde brillante
                tooltip.append('rect')
                    .attr('x', -80)
                    .attr('y', -70)
                    .attr('width', 160)
                    .attr('height', 65)
                    .attr('fill', 'none')
                    .attr('stroke', 'rgba(255, 255, 255, 0.2)')
                    .attr('stroke-width', 1)
                    .attr('rx', 8);

                text.forEach((line, i) => {
                    tooltip.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('y', -55 + (i * 18))
                        .style('fill', i === 0 ? '#fff' : i === 1 ? '#4caf50' : '#2196f3')
                        .style('font-size', i === 0 ? '15px' : '13px')
                        .style('font-weight', i === 0 ? 'bold' : '600')
                        .text(line);
                });
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 0.6)
                    .attr('stroke-width', 2);

                g.selectAll('.tooltip').remove();
            })
            .transition()
            .delay((d, i) => i * 30)
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr('cx', d => x(d[xKey]))
            .attr('cy', d => y(d[yKey]))
            .attr('r', d => size(d[sizeKey]))
            .on('end', function() {
                // Animación de brillo al finalizar
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr('opacity', 1)
                    .style('filter', 'url(#glow) drop-shadow(0 2px 4px rgba(0,0,0,0.2))');
            });

        // Ejes
        g.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(5))
            .selectAll('text')
            .style('font-size', '13px');

        g.append('g')
            .call(d3.axisLeft(y).ticks(5))
            .selectAll('text')
            .style('font-size', '13px');

        // Etiquetas de ejes
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', chartHeight + 45)
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text(xKey);

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('y', -60)
            .attr('x', -chartHeight / 2)
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text(yKey);

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width, chartHeight]])
            .on('zoom', (event) => {
                const newX = event.transform.rescaleX(x);
                const newY = event.transform.rescaleY(y);

                g.selectAll('.dot')
                    .attr('cx', d => newX(d[xKey]))
                    .attr('cy', d => newY(d[yKey]));

                g.select('.axis-x').call(d3.axisBottom(newX));
                g.select('.axis-y').call(d3.axisLeft(newY));
            });

        svg.call(zoom);

        // Toolbar
        const toolbar = d3.select(container).select('.d3-toolbar');
        toolbar.selectAll('*').remove();

        toolbar.append('button')
            .style('margin', '0 5px')
            .style('padding', '5px 10px')
            .style('cursor', 'pointer')
            .text('Zoom In')
            .on('click', () => svg.transition().call(zoom.scaleBy, 1.3));

        toolbar.append('button')
            .style('margin', '0 5px')
            .style('padding', '5px 10px')
            .style('cursor', 'pointer')
            .text('Zoom Out')
            .on('click', () => svg.transition().call(zoom.scaleBy, 0.7));

        toolbar.append('button')
            .style('margin', '0 5px')
            .style('padding', '5px 10px')
            .style('cursor', 'pointer')
            .text('Reset')
            .on('click', () => svg.transition().call(zoom.transform, d3.zoomIdentity));

    }, [data, xKey, yKey, labelKey, sizeKey, height, color]);

    return (
        <Box ref={containerRef} sx={{ width: '100%', position: 'relative' }}>
            <Box className="d3-toolbar" sx={{ mb: 1, textAlign: 'right' }} />
            <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
        </Box>
    );
}
