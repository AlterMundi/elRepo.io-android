import { Navigation } from "react-native-navigation";
import Sidebar from './src/containers/sidebar';
import { store} from './src/redux/store';
import { registerPages } from './src/RootNavigator'
import { Provider } from 'react-redux';

registerPages(store, Provider)
Navigation.registerComponent(`navigation.elRepoIO.drawer`, () => Sidebar);

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            sideMenu: {
                id: "SideMenu",
                right: {
                    component: {
                        id: "DownloadStatus",
                        name: "elRepoIO.downloadStatus"
                    }
                  },
                left: {
                  component: {
                      id: "Drawer",
                      name: "navigation.elRepoIO.drawer"
                  }
                },
                center: {
                    stack: {
                        id:'App',
                        children: [{
                            component: {
                                name: "elRepoIO.home",
                            }
                        }]
                    }, 
                }
            }
        }
    });
});