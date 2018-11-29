/* @flow */

import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Drawer,
  withTheme,
} from 'react-native-paper';
import { Navigation } from 'react-native-navigation';
import {connect } from 'react-redux';

class DownloadItems extends React.Component {
  state = {
    open: false,
    drawerItemIndex: 0,
  };

  render() {

    const { colors } =  this.props.theme
    return (
      <View style={[styles.drawerContent, { backgroundColor: colors.surface }]}>
        <Drawer.Section title="Descargas">
          {(this.props.downloading || []).map((props) => (
            <Drawer.Item
              label={props.mName}
              key={props.mHash}
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

export const DownloadStatus = connect(
    (state) => ({
        downloading: state.Api.donwloading || []
    })
)(withTheme(DownloadItems));