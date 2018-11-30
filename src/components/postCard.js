import React, { Component } from 'react';
import {  List, Title, Card } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Navigation } from 'react-native-navigation';
import ParsedText from 'react-native-parsed-text';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import apiActions from '../redux/api/actions'
import filesize from "filesize"

const fixTh = (base) => base
  .replace('dataimage','data:image')
  .replace('base64',';base64,')

const  removeHtml = (text) =>  text
    .replace(/<script([\S\s]*?)>([\S\s]*?)<\/script>/ig)
    .replace(/<style([\S\s]*?)>([\S\s]*?)<\/style>/ig)
    .replace(/<[^>]*>/g, '')
    .replace("undefined", "")
    .replace(/\&nbsp;(\s*)?/g, '\n')

const FileList = ({files, onDownload}) => (
    <View>
      {files.map(file => (
          <List.Item
            key={file.mHash}
            style={styles.list}
            title={file.mName}
            description={filesize(file.mSize)}
            onPress={()=>onDownload(file)}
            left={props => <List.Icon mode="text" icon="file-download"/>}
            />
      ))}
    </View>)
  
  class PostCardComponent extends Component  {
  
    constructor(props) {
      super(props);
      this.handleHastag = this.handleHastag.bind(this);
      this.handleDownload = this.handleDownload.bind(this);
    }
   
    handleHastag(hashtag){
      this.props.searchContent(hashtag);
      Navigation.push('App', {
        component: { name: 'elRepoIO.search' },
      })
    }

    handleDownload(file){
      this.props.fileInfo(file);
      Navigation.push('App', {
        component: { name: 'elRepoIO.fileInfo' }
      })
    }
  
    render() {
      const {post} = this.props;
      return (
          <Card >
              {post.mThumbnail.mData !== '' && post.mThumbnail.mData.indexOf('base64') !== -1 ?(<Card.Cover source={{ uri: fixTh(post.mThumbnail.mData) }} />): false }
              <Card.Content>
                  <Title>{post.mMeta.mMsgName}</Title>
                  <ParsedText
                    parse={[
                      {pattern: /#(\w+)/,  style: styles.hashTag, onPress: this.handleHastag}
                    ]}>
                    {removeHtml(post.mMsg)}
                  </ParsedText>
                  {
                        post.mFiles.length > 0
                            ? <FileList files={post.mFiles} onDownload={this.handleDownload}  />
                            : false
                    }
              </Card.Content>
          </Card>
      )
    }
  }

const styles = StyleSheet.create({
    list: {
        marginLeft: -4,
        marginRight: -4,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: "#f3f3f3",
        borderRadius: 2
      },
      hashTag: {
        color: 'blue',
        textDecorationLine: 'underline',
      }
})

   export const PostCard = connect(
     (state) => ({}),
     (dispatch) => ({
       fileInfo: bindActionCreators(apiActions.getFileInfo, dispatch),
      searchContent: bindActionCreators(apiActions.newSearch, dispatch)
     })
    )(PostCardComponent)
  