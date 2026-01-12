import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

export default function D3PieChart({ data, labelKey, valueKey, height = 400, colors }) {
    const svgRef = useRef();
    const containerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const container = containerRef.current;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const width = container.offsetWidth;
        const radius = Math.min(width, height) / 2 - 40;

        const g = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        // Color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d[labelKey]))
            .range(colors || d3.schemeSet3);

        // Pie
        const pie = d3.pie()
            .value(d => d[valueKey])
            .sort(null);

        // Arc
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        const arcHover = d3.arc()
            .innerRadius(0)
            .outerRadius(radius + 10);

        // Arcos
        const arcs = g.selectAll('.arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        // Sombra del pie
        g.append('g')
            .selectAll('.shadow')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('class', 'shadow')
            .attr('d', arc)
            .attr('transform', 'translate(2, 2)')
            .attr('fill', '#000')
            .attr('opacity', 0.15)
            .attr('filter', 'blur(4px)');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data[labelKey]))
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .style('opacity', 0.9)
            .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))')
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arcHover)
                    .style('opacity', 1)
                    .style('filter', 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))');

                // Tooltip
                const tooltip = g.append('g')
                    .attr('class', 'tooltip');

                tooltip.append('rect')
                    .attr('x', -80)
                    .attr('y', -40)
                    .attr('width', 160)
                    .attr('height', 60)
                    .attr('fill', 'black')
                    .attr('opacity', 0.8)
                    .attr('rx', 8);

                tooltip.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', -15)
                    .style('fill', 'white')
                    .style('font-size', '14px')
                    .style('font-weight', 'bold')
                    .text(d.data[labelKey]);

                tooltip.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', 10)
                    .style('fill', 'white')
                    .style('font-size', '16px')
                    .style('font-weight', 'bold')
                    .text(d.data[valueKey].toLocaleString());

                const percentage = ((d.data[valueKey] / d3.sum(data, d => d[valueKey])) * 100).toFixed(1);
                tooltip.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('y', 30)
                    .style('fill', 'white')
                    .style('font-size', '12px')
                    .text(`${percentage}%`);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arc)
                    .style('opacity', 0.8);

                g.selectAll('.tooltip').remove();
            })
            .transition()
            .duration(1000)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        // Etiquetas
        arcs.append('text')
            .attr('transform', d => {
                const pos = arc.centroid(d);
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * 0.6 * (midAngle < Math.PI ? 1 : -1) * Math.cos(midAngle - Math.PI / 2);
                pos[1] = radius * 0.6 * Math.sin(midAngle - Math.PI / 2);
                return `translate(${pos})`;
            })
            .attr('text-anchor', d => {
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return midAngle < Math.PI ? 'start' : 'end';
            })
            .style('font-size', '13px')
            .style('font-weight', '600')
            .style('fill', '#333')
            .text(d => {
                const percentage = ((d.data[valueKey] / d3.sum(data, d => d[valueKey])) * 100).toFixed(1);
                return percentage > 5 ? `${percentage}%` : '';
            });

        // Leyenda interactiva con fondo
        const legend = svg.append('g')
            .attr('transform', `translate(20, 20)`);

        const legendBg = legend.append('rect')
            .attr('x', -10)
            .attr('y', -10)
            .attr('width', 200)
            .attr('height', data.length * 28 + 20)
            .attr('fill', 'rgba(255, 255, 255, 0.95)')
            .attr('rx', 8)
            .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))');

        data.forEach((d, i) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${i * 28})`)
                .style('cursor', 'pointer')
                .on('mouseover', function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `translate(5, ${i * 28})`);
                })
                .on('mouseout', function() {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `translate(0, ${i * 28})`);
                });

            legendRow.append('rect')
                .attr('width', 20)
                .attr('height', 20)
                .attr('fill', color(d[labelKey]))
                .attr('rx', 5)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

            legendRow.append('text')
                .attr('x', 28)
                .attr('y', 15)
                .style('font-size', '13px')
                .style('font-weight', '600')
                .style('fill', '#333')
                .text(`${d[labelKey]}: ${d[valueKey].toLocaleString()}`);
        });

    }, [data, labelKey, valueKey, height, colors]);

    return (
        <Box ref={containerRef} sx={{ width: '100%', position: 'relative' }}>
            <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
        </Box>
    );
}
