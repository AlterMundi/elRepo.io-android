import React, { Component } from "react";
import { View, ScrollView, StyleSheet, ImageBackground} from "react-native";
import { connect } from "react-redux"
import { AppBar } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { Navigation } from "react-native-navigation";
import { PostCard }  from '../components/postCard';
import config from '../config'
import { ThemeWrapper } from "../components/wrapper";

const background = require('../assets/background.png');

const validsPosts = (post) => post.mMeta.mMsgName !== '' && post.mMsg !== ''

class HomeContainer extends Component {
    constructor(props) {
        super(props);
        this.handleSearch = this.handleSearch.bind(this);
    }
  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
  }

  handleSearch(value){
    this.props.searchContent(value);
    Navigation.push('App', {
      component: { name: 'elRepoIO.search' },
    })
  }
  
  render() {
    return (
      <ThemeWrapper>
        <AppBar title={'elRepo.io'} subtitle={'Publicaciones'} searchIcon={true} onSearch={this.handleSearch} />
        <ImageBackground  resizeMode="repeat" source={background}   style={{width: '100%', height: '100%'}}>
          <ScrollView style={styles.container}>
            {this.props.posts.map((post, key) => (
                <View key={key} style={styles.post} >
                    <PostCard post={post}  />
                  </View>
            ))}
          </ScrollView>
          </ImageBackground>
        </ThemeWrapper>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 10,
      paddingBottom: 10,
      marginBottom: 57,
      paddingLeft: 15,
      paddingRight: 15,
    },
    post: {
      paddingBottom: 15
    },
    content: {
      padding: 4
    }
  });
  


export const Home = connect(
  (state) => ({
    channels: state.Api.channels,
    channelsInfo: state.Api.channelsInfo,
    posts: (Object.values(state.Api.posts) || []).filter(validsPosts).sort((a,b) => (a.mMeta.mPublishTs < b.mMeta.mPublishTs)? 1: -1 )
  }),
  (dispatch) => ({
    searchContent: bindActionCreators(apiActions.newSearch, dispatch),
    updateChannels: bindActionCreators(apiActions.updateChannels, dispatch),
    loadExtraData: bindActionCreators(apiActions.loadExtraData, dispatch),
    loadChannelContent: bindActionCreators(apiActions.loadChannelContent, dispatch)
})
  
)(HomeContainer)