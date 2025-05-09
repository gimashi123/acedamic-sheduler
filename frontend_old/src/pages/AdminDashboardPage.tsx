import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AppProvider, type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from '@toolpad/core/internal';
import {Button} from "@mui/material";


import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';



const NAVIGATION: Navigation = [
    {
        segment: 'dashboard',
        title: 'TimeTable Management',
        icon: <DashboardIcon />,
    },
    {
        segment: 'orders',
        title: 'User Management',
        icon: <ShoppingCartIcon />,
    },
];

const demoTheme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true, dark: true },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});



function DemoPageContent({ pathname }: { pathname: string }) {

    return (
        <Box>

        </Box>
    );
}

interface DemoProps {
    /**
     * Injected by the documentation to work in an iframe.
     * Remove this when copying and pasting into your project.
     */

    window?: () => Window;
}

export default function DashboardLayoutBranding(props: DemoProps) {
    const { window } = props;

    const router = useDemoRouter('/dashboard');

    // Remove this const when copying and pasting into your project.
    const demoWindow = window !== undefined ? window() : undefined;

    return (
        // preview-start
        <AppProvider
            navigation={NAVIGATION}
            branding={{
                title: 'Admin',
                homeUrl: '/toolpad/core/introduction',
            }}
            router={router}
            theme={demoTheme}
            window={demoWindow}
        >

            <DashboardLayout>
                <DemoPageContent pathname={router.pathname} />
            </DashboardLayout>
        </AppProvider>
        // preview-end
    );
}