// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext.tsx';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';
import {
    ModuleRegistry,
    ClientSideRowModelModule,
    TextFilterModule,
} from 'ag-grid-community';
import {
    RowGroupingModule,
    RowGroupingPanelModule,
    GroupFilterModule,
    ValidationModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    TextFilterModule,
    GroupFilterModule,
    ValidationModule,
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AuthProvider>
                    <App />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
     </React.StrictMode>
);