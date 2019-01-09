/* @flow */

import * as React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  Text,
  Drawer,
  withTheme,
  ProgressBar,
  Button,
} from 'react-native-paper';
import { ThemeWrapper } from '../components/wrapper'
import {connect } from 'react-redux';
import config from '../config';
import FileViewer from 'react-native-file-viewer';


const calcProgress = (chunks =[]) => {
  const total = chunks.length;
  const ready = chunks.filter(x => x === 2).length
  return ready === 0? 0: ready / total; 
}

const getStatus = (download) => {
  if (calcProgress(download.chunks) === 1) {
    return (
      <Button
        onPress={()=>
          FileViewer
            .open(download.info.path+'/'+download.info.fname)
            .then(console.log)
            .catch(console.warn) }>
      Abrir
    </Button>);
  }
  else if  (download.active_chunks.length > 0) {
    return <Text>Descargando</Text>;
  }
  else if (download.compressed_peer_availability_maps > 0) {
    return <Text>Estableciendo conexiones</Text>
  }
  else {
    return <Text>Esperando pares</Text>
  }
}

class DownloadItems extends React.Component {
  state = {
    open: false,
    drawerItemIndex: 0,
  };

  render() {
    return (
      <View style={[styles.drawerContent, { backgroundColor: config.theme.colors.surface }]}>
        <Drawer.Section title="Descargas activas"theme={config.theme} style={{margin: 10}}>
          {(this.props.downloading || []).map((props) => (
            <View key={props.info.hash} style={{backgroundColor: 'rgba(245,245,245,0.8)', padding: 10, borderRadius: 4, marginBottom: 10}}>
                <Text>{props.info.fname}</Text>
                <ProgressBar progress={calcProgress(props.chunks)}/>
                {getStatus(props)}
              </View>
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
        downloading: state.Api.downloading || []
    })
)(withTheme(DownloadItems));