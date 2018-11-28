import React, { Component } from "react";
import { View , ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux"
import {  Headline } from 'react-native-paper';
import { AppBar } from "../components/appbar";
import { PostCard } from "../components/postCard";

import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"

const validsPosts = (post) => post.mMeta.mMsgName !== '' && post.mMsg !== ''

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
          <View style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Resultados de busqueda'} />
                <ScrollView style={styles.container}>
                  <View style={styles.content}>
                    <Headline>  {this.props.search}</Headline>
                    {this.props.results.map((post, key) => (
                      <PostCard key={key} post={post} />
                    ))}
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
  


export const Search = connect(
  (state) => ({
    results: (Object.values(state.Api.posts) || []).filter(validsPosts),
    search: state.Api.search || ''
  }),
  (dispatch) => ({
    updateChannels: bindActionCreators(apiActions.updateChannels, dispatch),
    loadExtraData: bindActionCreators(apiActions.loadExtraData, dispatch),
    loadChannelContent: bindActionCreators(apiActions.loadChannelContent, dispatch)
})
  
)(SearchContainer)