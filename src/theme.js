import { createTheme } from '@mui/material/styles';

// Kurumsal Renkler
const brandColors = {
    gold: 'rgb(248, 194, 36)',
    blue: 'rgb(79, 129, 189)',
    blueLight: 'rgba(79, 129, 189, 0.1)',
    white: 'rgb(255, 255, 255)',
    dark: '#1a1a2e',
    gray: '#6c757d',
    grayLight: '#f8f9fa',
};

const theme = createTheme({
    palette: {
        primary: {
            main: brandColors.gold,
            light: '#ffd54f',
            dark: '#c9a227',
            contrastText: '#1a1a2e',
        },
        secondary: {
            main: brandColors.blue,
            light: '#a8c0db',
            dark: '#4a7ab8',
            contrastText: '#ffffff',
        },
        background: {
            default: brandColors.grayLight,
            paper: brandColors.white,
        },
        text: {
            primary: brandColors.dark,
            secondary: brandColors.gray,
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 2px 4px rgba(0,0,0,0.05)',
        '0 4px 8px rgba(0,0,0,0.08)',
        '0 8px 16px rgba(0,0,0,0.1)',
        '0 12px 24px rgba(0,0,0,0.12)',
        '0 16px 32px rgba(0,0,0,0.14)',
        ...Array(19).fill('0 16px 32px rgba(0,0,0,0.14)'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(248, 194, 36, 0.3)',
                    },
                },
                contained: {
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: brandColors.blue,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: brandColors.gold,
                        },
                    },
                },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 'none',
                    borderRadius: 12,
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: brandColors.blueLight,
                        borderRadius: '12px 12px 0 0',
                    },
                    '& .MuiDataGrid-row:hover': {
                        backgroundColor: brandColors.blueLight,
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: brandColors.blue,
                    color: brandColors.white,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&.Mui-selected': {
                        backgroundColor: brandColors.gold,
                        color: brandColors.dark,
                        '&:hover': {
                            backgroundColor: brandColors.gold,
                        },
                        '& .MuiListItemIcon-root': {
                            color: brandColors.dark,
                        },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    minWidth: 40,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: brandColors.white,
                    color: brandColors.dark,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
            },
        },
    },
});

export default theme;
export { brandColors };
