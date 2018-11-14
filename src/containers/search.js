import React, { Component } from "react";
import { View , ScrollView, StyleSheet} from "react-native";
import { connect } from "react-redux"
import {  Text, Paragraph, Title, Card } from 'react-native-paper';
import { AppBar, } from "../components/appbar";

import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"

const validsPosts = (post) => post.mMeta.mMsgName !== '' && post.mMsg !== ''

const PostCard = ({post}) =>  (
  <Card  style={styles.card}>
      <Card.Content>
          <Title>{post.mMeta.mMsgName}</Title>
          <Paragraph> {post.mMsg}</Paragraph>
      </Card.Content>
  </Card>
)

class SearchContainer extends Component {
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
          <View>
              <AppBar title={'elRepo.io'} subtitle={'Publicaciones'} />
                
                {this.props.posts.map(post => (
                        <PostCard key={post.id} post={post} onDownload={console.log} />
                ))}
                
          </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%'
    },
    content: {
      padding: 4,
    },
    card: {
      margin: 8,
    },
  });
  


export const Search = connect(
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
  
)(SearchContainer)