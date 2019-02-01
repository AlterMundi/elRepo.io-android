import React, { Component } from "react";
import { View , ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux"
import {  Text, Headline, Button } from 'react-native-paper';
import { AppBar } from "../components/appbar";
import { PostCard }  from "../components/postCard";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import filesize from 'filesize'
import { Navigation } from "react-native-navigation";
import { ThemeWrapper } from '../components/wrapper'
import { calcProgress } from './downloadStatus';
import { apiCall } from "../helpers/apiWrapper";

const getPostsByFileHash = (state) => {
    const hasFile = file => file.mHash === state.Api.fileInfo.mHash;
    const post = Object.keys(state.Api.posts).map(key => state.Api.posts[key]);
    return post
        .filter(post => typeof post.mFiles !== 'undefined')
        .filter(post => post.mFiles.filter(hasFile).length > 0)
}


// 1 > open / 2 > donwloading / 3 download / 0 loading
const calcStatus = (fileInfo) => {
    console.log('AAAAA',fileInfo)
    return fileInfo.info
        ? (calcProgress(fileInfo.info.chunks) === 1
            ? 1
            : fileInfo.info.chunks.length > 0
                ? 2
                 : 3
             )
        : 0
}

class FileInfoContainer extends Component {
    constructor(props) {
        super(props);
        this.download = this.download.bind(this)
    }
  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
  }
  
  download(file) {
    this.props.downloadFile(file)
    Navigation.push('App', {
        component: { name: 'elRepoIO.home' }
      })
  }

  delete( file ) {

  }

  open( file ) {
      
  }

  stopDownload( file ) {
    this.props.cancelDownload(file.mHash)
  }

  render() {
    const {fileInfo, posts} = this.props;
    const status = [
        { text: 'Cargando estado...', action: ()=>null},
        { text: 'Abrir', action: (file)=> ()=> this.open(file)}, 
        { text: 'Cancelar Descarga', action: (file) => ()=> this.stopDownload(file)},
        {text: 'Descargar', action: (file)=> ()=>  this.download(file)},
    ]
    return (
          <ThemeWrapper style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Información del archivo'} />
              <View style={styles.container}>
                    <View style={{...styles.content, ...{ padding: 10, paddingBottom: 15, backgroundColor: '#ffffff'}}}>
                        <Headline>Archivo</Headline>
                        <Text>Nombre: {fileInfo.mName}</Text>
                        <Text>Tamaño {filesize(fileInfo.mSize)}</Text>
                        <Button style ={styles.button} mode="contained" dark={true} onPress={status[calcStatus(fileInfo)].action(fileInfo)}>{status[calcStatus(fileInfo)].text}</Button>
                    </View>
                    <Headline style={styles.headers}>Publicaciones relacionadas</Headline>
                    <ScrollView style={{...styles.content, ...{ backgroundColor: 'rgb(240,240,240)'}}}>
                        <View style={{...styles.content, ...{padding: 10}}}>
                            {posts.map(post => <PostCard post={post} key={post.key} />)}
                        </View>
                    </ScrollView>
                </View>
          </ThemeWrapper>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    headers: {
        marginTop: 15,
        marginLeft: 10,
        marginBottom: 20

    },
    button: {
        marginTop: 10
    },
    content: {
      padding: 5,
    }
  });
  


export const FileInfo = connect(
  (state) => ({
    fileInfo: state.Api.fileInfo,
    posts: getPostsByFileHash(state)
  }),
  (dispatch) => ({
    cancelDownload: (hash) => dispatch({ type: 'CANCEL_DOWNLOAD', payload: {hash, reload: true}}),
    downloadFile: bindActionCreators(apiActions.download, dispatch)
})
  
)(FileInfoContainer)