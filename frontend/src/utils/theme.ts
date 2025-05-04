import { createTheme, PaletteOptions } from '@mui/material/styles';

// Defined a custom palette interface extending PaletteOptions
interface CustomPaletteOptions extends PaletteOptions {
    key?: string;
}

// Created a theme instance with the custom palette interface
const theme = createTheme({
    palette: {
        background: {
            default: '#ffffff' // Set the background color of the whole body
        },
        text: {
            primary: '#000000' // Set the overall text color to white
        },
        border: '#000000' // Set the border color
    } as CustomPaletteOptions // Cast the palette to the custom palette interface
});

export default theme;
