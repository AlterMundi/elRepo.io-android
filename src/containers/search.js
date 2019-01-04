import React, { Component } from "react";
import { View , ScrollView, StyleSheet , ImageBackground} from "react-native";
import { connect } from "react-redux"
import {  Headline } from 'react-native-paper';
import { AppBar } from "../components/appbar";
import { PostCard } from "../components/postCard";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import {  ThemeWrapper } from  '../components/wrapper'

const background = require('../assets/background.png');

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
      <ThemeWrapper>
          <View style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Resultados de busqueda'} />
                <ImageBackground  resizeMode="repeat" source={background}   style={{width: '100%', height: '100%'}}>
                  <ScrollView style={styles.container}>
                    <View style={styles.content}>
                      <Headline>Resultados de: {this.props.search}</Headline>
                      {this.props.results.map((post, key) => (
                        <View style={styles.post} key={key}>
                          <PostCard  post={post} />
                          </View>
                      ))}
                      </View>
                  </ScrollView>
                </ImageBackground>
          </View>
        </ThemeWrapper>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 4,
      paddingLeft: 15,
      paddingRight: 15
    },
    post: {
      paddingBottom: 15
    },
  });
  


export const Search = connect(
  (state) => ({
    results: state.Api.posts,
    search: state.Api.search || ''
  }),
  (dispatch) => ({
    updateChannels: bindActionCreators(apiActions.updateChannels, dispatch),
    loadExtraData: bindActionCreators(apiActions.loadExtraData, dispatch),
    loadChannelContent: bindActionCreators(apiActions.loadChannelContent, dispatch)
})
  
)(SearchContainer)