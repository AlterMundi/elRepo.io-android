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

const getPostsByFileHash = (state) => {
    const hasFile = file => file.mHash === state.Api.fileInfo.mHash;
    const post = Object.keys(state.Api.posts).map(key => state.Api.posts[key]);
    return post
        .filter(post => typeof post.mFiles !== 'undefined')
        .filter(post => post.mFiles.filter(hasFile).length > 0)
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

  render() {
    const {fileInfo, posts} = this.props;
    return (
          <View style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Información del archivo'} />
                <ScrollView style={styles.container}>
                    <View style={styles.content}>
                        <Headline>File</Headline>
                        <Text>Nombre {fileInfo.mName}</Text>
                        <Text>Id {fileInfo.mHash}</Text>
                        <Text>Tamaño {filesize(fileInfo.mSize)}</Text>
                        <Button mode="contained" onPress={()=> this.download(fileInfo)}>Descargar</Button>
                        {/* <Headline>Publicaciones relacionadas</Headline>
                        {posts.map(post => <PostCard post={post} key={post.id} />)} */}
                    </View>
                </ScrollView>
                
          </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    content: {
      padding: 4,
    }
  });
  


export const FileInfo = connect(
  (state) => ({
    fileInfo: state.Api.fileInfo,
    posts: getPostsByFileHash(state)
  }),
  (dispatch) => ({
    downloadFile: bindActionCreators(apiActions.download, dispatch)
})
  
)(FileInfoContainer)