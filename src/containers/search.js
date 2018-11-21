import React, { Component } from "react";
import { View , ScrollView, StyleSheet} from "react-native";
import { connect } from "react-redux"
import {  Text, Paragraph, Title, Card, Headline } from 'react-native-paper';
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
          <View style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Resultados de busqueda'} />
                <ScrollView style={styles.container}>
                  <View style={styles.content}>
                    <Headline>  {this.props.search}</Headline>
                    {this.props.results.map(post => (
                      <PostCard key={post.id} post={post} onDownload={console.log} />
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
      padding: 16,
    },
    card: {
      margin: 8,
    },
  });
  


export const Search = connect(
  (state) => ({
    results: state.Api.results || [],
    search: state.Api.search || ''
  }),
  (dispatch) => ({
    updateChannels: bindActionCreators(apiActions.updateChannels, dispatch),
    loadExtraData: bindActionCreators(apiActions.loadExtraData, dispatch),
    loadChannelContent: bindActionCreators(apiActions.loadChannelContent, dispatch)
})
  
)(SearchContainer)