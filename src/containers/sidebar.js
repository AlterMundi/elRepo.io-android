/* @flow */

import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Drawer,
  withTheme,
  Colors,
} from 'react-native-paper';
import { Navigation } from 'react-native-navigation';

const DrawerItemsData = [
  { label: 'Publicaciones', icon: 'inbox', key: 0, goTo: 'elRepoIO.home' },
  { label: 'Subir', icon: 'file-upload', key: 1, goTo: 'elRepoIO.upload'},
  { label: 'Buscar', icon: 'search', key: 2 , goTo: 'elRepoIO.search'},
  { label: 'Estado de red', icon: 'settings-input-antenna', key: 3 , goTo: 'elRepoIO.status'}
];

class DrawerItems extends React.Component {
  state = {
    open: false,
    drawerItemIndex: 0,
  };

  _setDrawerItem = (index,goTo) => {
    this.setState({ drawerItemIndex: index })  
      Navigation.push('App', {
        component: { name: goTo },
      })
      Navigation.mergeOptions('SideMenu', {
        sideMenu: {
            left: {
              visible: false
            }
          }
      })
  };

  render() {

    const { colors } =  this.props.theme
    console.log(this.props)
    return (
      <View style={[styles.drawerContent, { backgroundColor: colors.surface }]}>
        <Drawer.Section>
          {DrawerItemsData.map((props) => (
            <Drawer.Item
              {...props}
              key={props.key}
              active={this.state.drawerItemIndex === props.key}
              onPress={() => this._setDrawerItem(props.key, props.goTo)}
            />
          ))}
        </Drawer.Section>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 22,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default withTheme(DrawerItems);