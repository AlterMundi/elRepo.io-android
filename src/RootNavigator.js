import { Navigation } from "react-native-navigation";
import { Pages } from './routes';

export const registerPages = (store, Provider) => 
    Pages.map(Page => Navigation.registerComponentWithRedux (Page.id,()=>Page.component, Provider, store ));

