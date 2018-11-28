import React, { Component } from "react";
import { View , ScrollView, StyleSheet} from "react-native";
import { connect } from "react-redux"
import { AppBar } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { Navigation } from "react-native-navigation";
import { PostCard }  from '../components/postCard';

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
      <View style={styles.container}>
        <AppBar title={'elRepo.io'} subtitle={'Publicaciones'} searchIcon={true} onSearch={this.handleSearch} />
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
    }
  });
  


export const Home = connect(
  (state) => ({
    channels: state.Api.channels,
    channelsInfo: state.Api.channelsInfo,
    posts: (Object.values(state.Api.posts) || []).filter(validsPosts)
  }),
  (dispatch) => ({
    searchContent: bindActionCreators(apiActions.newSearch, dispatch),
    updateChannels: bindActionCreators(apiActions.updateChannels, dispatch),
    loadExtraData: bindActionCreators(apiActions.loadExtraData, dispatch),
    loadChannelContent: bindActionCreators(apiActions.loadChannelContent, dispatch)
})
  
)(HomeContainer)