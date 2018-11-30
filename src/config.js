import { DefaultTheme } from 'react-native-paper';

export default {
    api: {
        url: 'http://localhost',
        port: 9092
    },
    tiers1: [{
        id: '52057b7b1840fff66291099105a8a5db',
        name: 'Tier1',
        url: 'http://pool.elrepo.io'
    }],
    theme: {
        ...DefaultTheme,
        dark: true,
        roundness: 4,
        colors: {
            ...DefaultTheme.colors,
            primary: '#89b52f',
            background: "#e9e9e7",
            accent: "#dacf5b",
        }
    }
}