import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box } from '@mui/material';

export default function D3LineChart({ data, xKey, yKeys, height = 400, colors = ['#1976d2', '#dc004e', '#ff9800'] }) {
    const svgRef = useRef();
    const containerRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return;

        const container = containerRef.current;
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 40, right: 120, bottom: 60, left: 80 };
        const width = container.offsetWidth - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr('width', width + margin.left + margin.right)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Escalas
        const x = d3.scalePoint()
            .domain(data.map(d => d[xKey]))
            .range([0, width])
            .padding(0.5);

        const allYValues = yKeys.flatMap(key => data.map(d => d[key]));
        const y = d3.scaleLinear()
            .domain([d3.min(allYValues) || 0, d3.max(allYValues) || 0])
            .range([chartHeight, 0])
            .nice();

        // Grid de fondo (after scales are defined)
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
            .data(data)
            .enter()
            .append('line')
            .attr('x1', d => x(d[xKey]))
            .attr('x2', d => x(d[xKey]))
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('stroke', '#f0f0f0')
            .attr('stroke-width', 0.5);

        gridGroup.transition().duration(800).style('opacity', 1);

        // Líneas
        const line = d3.line()
            .x(d => x(d[xKey]))
            .y((d, i, nodes) => y(d[nodes[0].parentNode.getAttribute('data-key')]))
            .curve(d3.curveMonotoneX);

        yKeys.forEach((key, index) => {
            // Área con gradiente
            const defs = svg.append('defs');
            const gradient = defs.append('linearGradient')
                .attr('id', `area-gradient-${index}`)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', colors[index % colors.length])
                .attr('stop-opacity', 0.3);
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', colors[index % colors.length])
                .attr('stop-opacity', 0.05);

            // Área bajo la línea
            const area = d3.area()
                .x(d => x(d[xKey]))
                .y0(chartHeight)
                .y1(d => y(d[key]))
                .curve(d3.curveMonotoneX);

            g.append('path')
                .datum(data)
                .attr('fill', `url(#area-gradient-${index})`)
                .attr('d', area)
                .attr('opacity', 0)
                .transition()
                .duration(1000)
                .attr('opacity', 1);

            const path = g.append('path')
                .datum(data)
                .attr('data-key', key)
                .attr('fill', 'none')
                .attr('stroke', colors[index % colors.length])
                .attr('stroke-width', 4)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
                .attr('d', d3.line()
                    .x(d => x(d[xKey]))
                    .y(d => y(d[key]))
                    .curve(d3.curveMonotoneX)
                );

            // Animación
            const totalLength = path.node().getTotalLength();
            path
                .attr('stroke-dasharray', totalLength + ' ' + totalLength)
                .attr('stroke-dashoffset', totalLength)
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr('stroke-dashoffset', 0);

            // Puntos con efecto pulse
            const pointsGroup = g.append('g');
            
            // Anillos de pulse
            pointsGroup.selectAll(`.pulse-${index}`)
                .data(data)
                .enter()
                .append('circle')
                .attr('class', `pulse-${index}`)
                .attr('cx', d => x(d[xKey]))
                .attr('cy', d => y(d[key]))
                .attr('r', 5)
                .attr('fill', 'none')
                .attr('stroke', colors[index % colors.length])
                .attr('stroke-width', 2)
                .attr('opacity', 0.6)
                .each(function() {
                    const circle = d3.select(this);
                    function pulse() {
                        circle.transition()
                            .duration(2000)
                            .attr('r', 15)
                            .attr('opacity', 0)
                            .on('end', function() {
                                circle.attr('r', 5).attr('opacity', 0.6);
                                pulse();
                            });
                    }
                    pulse();
                });

            // Puntos principales
            pointsGroup.selectAll(`.dot-${index}`)
                .data(data)
                .enter()
                .append('circle')
                .attr('class', `dot-${index}`)
                .attr('cx', d => x(d[xKey]))
                .attr('cy', d => y(d[key]))
                .attr('r', 0)
                .attr('fill', colors[index % colors.length])
                .attr('stroke', '#fff')
                .attr('stroke-width', 3)
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))')
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('r', 10).style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))');
                    
                    // Tooltip
                    const tooltip = g.append('g')
                        .attr('class', 'tooltip')
                        .attr('transform', `translate(${x(d[xKey])},${y(d[key]) - 20})`);
                    
                    tooltip.append('rect')
                        .attr('x', -40)
                        .attr('y', -25)
                        .attr('width', 80)
                        .attr('height', 20)
                        .attr('fill', 'black')
                        .attr('opacity', 0.8)
                        .attr('rx', 4);
                    
                    tooltip.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('y', -10)
                        .style('fill', 'white')
                        .style('font-size', '12px')
                        .style('font-weight', 'bold')
                        .text(d[key].toLocaleString());
                })
                .on('mouseout', function() {
                    d3.select(this).attr('r', 5);
                    g.selectAll('.tooltip').remove();
                })
                .transition()
                .delay((d, i) => i * 50)
                .duration(500)
                .attr('r', 5);
        });

        // Ejes
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

        g.append('g')
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d.toLocaleString()))
            .selectAll('text')
            .style('font-size', '13px');

        // Leyenda interactiva
        const legend = g.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);

        yKeys.forEach((key, index) => {
            const legendRow = legend.append('g')
                .attr('transform', `translate(0, ${index * 30})`)
                .style('cursor', 'pointer')
                .on('mouseover', function() {
                    d3.select(this).select('rect')
                        .transition()
                        .duration(200)
                        .attr('width', 18)
                        .attr('height', 18);
                    d3.select(this).select('text')
                        .transition()
                        .duration(200)
                        .attr('font-size', '15px');
                })
                .on('mouseout', function() {
                    d3.select(this).select('rect')
                        .transition()
                        .duration(200)
                        .attr('width', 15)
                        .attr('height', 15);
                    d3.select(this).select('text')
                        .transition()
                        .duration(200)
                        .attr('font-size', '14px');
                });

            legendRow.append('rect')
                .attr('width', 15)
                .attr('height', 15)
                .attr('rx', 3)
                .attr('fill', colors[index % colors.length])
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

            legendRow.append('text')
                .attr('x', 22)
                .attr('y', 12)
                .style('font-size', '14px')
                .style('font-weight', '600')
                .style('fill', '#333')
                .text(key);
        });

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width, chartHeight]])
            .on('zoom', (event) => {
                const newX = event.transform.rescaleX(x);
                const newY = event.transform.rescaleY(y);

                g.selectAll('path[data-key]')
                    .attr('d', function() {
                        const key = d3.select(this).attr('data-key');
                        return d3.line()
                            .x(d => newX(d[xKey]))
                            .y(d => newY(d[key]))(data);
                    });

                g.selectAll('circle')
                    .attr('cx', d => newX(d[xKey]))
                    .attr('cy', function() {
                        const className = d3.select(this).attr('class');
                        const index = parseInt(className.split('-')[1]);
                        const d = d3.select(this).datum();
                        return newY(d[yKeys[index]]);
                    });

                g.select('.axis-x')
                    .call(d3.axisBottom(newX));

                g.select('.axis-y')
                    .call(d3.axisLeft(newY));
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

    }, [data, xKey, yKeys, height, colors]);

    return (
        <Box ref={containerRef} sx={{ width: '100%', position: 'relative' }}>
            <Box className="d3-toolbar" sx={{ mb: 1, textAlign: 'right' }} />
            <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
        </Box>
    );
}
