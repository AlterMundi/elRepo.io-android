import React from 'react';
import { Provider } from 'react-native-paper';
import config from '../config';

export const ThemeWrapper = ({children}) => (
    <Provider theme={config.theme}>
        {children}
    </Provider>
)

