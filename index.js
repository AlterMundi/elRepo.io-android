import { Navigation } from "react-native-navigation";
import Sidebar from './src/containers/sidebar';
import { store} from './src/redux/store';
import { registerPages } from './src/RootNavigator'
import { Provider } from 'react-redux';

registerPages(store, Provider)
Navigation.registerComponent(`navigation.elRepoIO.drawer`, () => Sidebar);

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setDefaultOptions({
        _animations: {
          push: {
            waitForRender: false,
          }
        },
        animations: {
          setRoot: {
            alpha: {
              from: 0,
              to: 1,
              duration: 300
            }
          },
          _push: {
            content: {
              y: {
                from: 1000,
                to: 0,
                duration: 500,
                interpolation: 'accelerate',
              },
              alpha: {
                from: 0,
                to: 1,
                duration: 500,
                interpolation: 'accelerate'
              }
            }
          },
          _pop: {
            content: {
              y: {
                from: 0,
                to: 1000,
                duration: 500,
                interpolation: 'decelerate',
              },
              alpha: {
                from: 1,
                to: 0,
                duration: 500,
                interpolation: 'decelerate'
              }
            }
          }
        }
      });
  
  
    Navigation.setRoot({
        root: {
            sideMenu: {
                id: "SideMenu",
                center: {
                    stack: {
                        id:'App',
                        children: [{
                            component: {
                                name: "elRepoIO.splash",
                            }
                        }]
                    }, 
                }
            }
        }
    });
});