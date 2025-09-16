import { useState } from 'react';

import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import { CardHeader } from '@mui/material';

import Chart, { useChart } from 'src/components/chart';
import { CustomSmallSelect } from "../../../../components/custom-input";

// ----------------------------------------------------------------------

export default function EcommerceYearlySales({ title, subheader, chart, sx, ...other }) {
    const [selectedSeries, setSelectedSeries] = useState('2025');

    const chartOptions = useChart({
        xaxis: { categories: chart.categories },
        stroke: { width: [3, 3] },
        markers: { size: 4 },
        yaxis: {
            labels: {
                formatter: (val) => `$${val.toFixed(2)}`,
            },
        },
        tooltip: {
            y: {
                formatter: (val) => `$${val.toFixed(2)}`,
            },
        },
        ...chart.options,
    });

    const currentSeries = chart.series.find((i) => i.name === selectedSeries);

    return (
        <Card sx={sx} {...other}>
            <CardHeader
                title={title}
                subheader={subheader}
                action={
                    <CustomSmallSelect
                        value={selectedSeries}
                        onChange={(event) => setSelectedSeries(event.target.value)}
                    >
                        {chart.series.map((option) => (
                            <option key={option.name} value={option.name}>
                                {option.name}
                            </option>
                        ))}
                    </CustomSmallSelect>
                }
            />

            <Chart
                type="line"
                series={currentSeries?.data}
                options={chartOptions}
                slotProps={{ loading: { p: 2.5 } }}
                sx={{
                    pl: 1,
                    py: 2.5,
                    pr: 2.5,
                    height: 320,
                }}
            />
        </Card>
    );
}
