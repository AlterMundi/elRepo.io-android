/* @flow */

import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {  Drawer } from 'react-native-paper';
import { Navigation } from 'react-native-navigation';
import config from '../config';


const DrawerItemsData = [
  { label: 'Publicaciones', icon: 'inbox', key: 0, goTo: 'elRepoIO.home' },
  { label: 'Descargas', icon: 'folder-shared', key: 4, goTo: 'elRepoIO.fileList'},
  { label: 'Buscar', icon: 'search', key: 1 , goTo: 'elRepoIO.search'},
  { label: 'Publicar', icon: 'file-upload', key: 2, goTo: 'elRepoIO.upload'},
  { label: 'Estado de red', icon: 'settings-input-antenna', key: 3 , goTo: 'elRepoIO.status'}
];

class DrawerItems extends React.Component {
  state = {
    open: false,
    drawerItemIndex: 0,
  };

  _setDrawerItem = (index,goTo) => {
    this.setState({ drawerItemIndex: index })  
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        left: {
          visible: false
        }
      }
    })
    Navigation.push('App', {
      component: { name: goTo },
    })
  };

  render() {
    return (
      <View style={[styles.drawerContent, { backgroundColor: config.theme.colors.surface }]}>
        <Drawer.Section theme={config.theme}>
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

export default DrawerItems;