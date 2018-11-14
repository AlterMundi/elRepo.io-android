import React, { Component } from "react";
import { View , ScrollView, StyleSheet} from "react-native";
import { connect } from "react-redux"
import {  List, Paragraph, Title, Card, Button } from 'react-native-paper';
import { AppBar, } from "../components/appbar";
import ParsedText from 'react-native-parsed-text';

import filesize from "filesize"

import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"

const validsPosts = (post) => post.mMeta.mMsgName !== '' && post.mMsg !== ''

const FileList = ({files}) => (
  <View>
    {files.map(file => (
        <List.Item
          style={styles.list}
          title={file.mName}
          description={filesize(file.mSize)}
          onPress={(a)=> console.log(a)}
          left={props => <List.Icon mode="text" icon="file-download"/>}
          />
    ))}
  </View>)

class PostCard extends Component  {
 
  handleHastag(hastagl){

  }

  render() {
    const {post} = this.props;
    return (
      <Card  style={styles.card}>
          <Card.Content>
              <Title>{post.mMeta.mMsgName}</Title>
              <ParsedText
                parse={[
                  {pattern: /#(\w+)/,  style: styles.hashTag, onPress: this.handleHastag}
                ]}>
                {post.mMsg}
              </ParsedText>
              {
                    post.mFiles.length > 0
                        ? <FileList files={post.mFiles}  />
                        : false
                }
          </Card.Content>
      </Card>
    )
  }
}

class HomeContainer extends Component {
    constructor(props) {
        super(props);
    }
  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
  }
  
  render() {
    return (
      <View style={styles.container}>
        <AppBar title={'elRepo.io'} subtitle={'Publicaciones'} />
          <ScrollView style={styles.container}>
            {this.props.posts.map(post => (
                    <PostCard key={post.id} post={post}  />
            ))}
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
    },
    card: {
      margin: 8,
    },
    list: {
      marginLeft: -4,
      marginRight: -4,
      marginTop: 10,
      backgroundColor: "#f3f3f3",
      borderRadius: 2
    },
    hashTag: {
      color: 'blue',
      textDecorationLine: 'underline',
    },
  });
  


export const Home = connect(
  (state) => ({
    stauts: state.Api.login? 'Online': 'Logged out',
    userId: state.Api.user? state.Api.user.mLocationName: '',
    friends: state.Api.peers? state.Api.peers : [],
    user: state.Api.user,
    channels: state.Api.channels,
    channelsInfo: state.Api.channelsInfo,
    posts: (Object.values(state.Api.posts) || []).filter(validsPosts)
  }),
  (dispatch) => ({
    updateChannels: bindActionCreators(apiActions.updateChannels, dispatch),
    loadExtraData: bindActionCreators(apiActions.loadExtraData, dispatch),
    loadChannelContent: bindActionCreators(apiActions.loadChannelContent, dispatch)
})
  
)(HomeContainer)