import React, { Component } from "react";
import { FlatList, View, RefreshControl, StyleSheet, ImageBackground } from "react-native";
import { connect } from "react-redux"
import { AppBar } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { Navigation } from "react-native-navigation";
import { PostCard }  from '../components/postCard';
import { ThemeWrapper } from "../components/wrapper";

const background = require('../assets/background.png');

class HomeContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
          until: 5,
          flatListReady:false,
          ready: false
        }
        this.addPosts = this.addPosts.bind(this)
        this.handleSearch = this.handleSearch.bind(this);
        this._onRefresh = this._onRefresh.bind(this);
    }
  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
  }

  addPosts() {
    if(this.state.flatListReady === false){ return null}
    this.setState({
      until: this.state.until + 2
    })
  }

  handleSearch(value){
    this.props.searchContent(value);
    Navigation.push('App', {
      component: { name: 'elRepoIO.search' },
    })
  }

  componentWillReceiveProps(newProps) {
    if (newProps.posts.length !== this.props.posts.length) {
      //this.forceUpdate();
    }
  }

  _onRefresh() {
    this.props.reloadChannels();
    setTimeout(()=>{
      this.setState({refreshing: false})
    }, 2000)
  }
  
  _scrolled(){
    if(this.state.flatListReady === true) { return null }
    this.setState({flatListReady:true})
  }

  componentWillMount() {
    this.setState({ready: false})
    setTimeout(()=>this.setState({ready:true}), 400)
  }


  render() {
    return (
      <ThemeWrapper>
        <AppBar title={'elRepo.io'} subtitle={'Publicaciones'} searchIcon={true} onSearch={this.handleSearch} />
        <ImageBackground  resizeMode="repeat" source={background}   style={{width: '100%', height: '100%'}}>
          <FlatList 
            refreshing={this.state.refreshing}
            refreshControl={
              <RefreshControl
                refreshing={this.props.posts.length === 0 || this.state.ready === false || this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            data={this.state.ready? this.props.posts.filter((_,key)=> key <= this.state.until): []}
            onEndReachedThreshold={0.3}
            onEndReached={this.addPosts}
            onScroll={this._scrolled.bind(this)}
            style={styles.container}
            renderItem={ element => 
                <View style={styles.post} key={element.key}>
                    <PostCard post={element.item}  componentId={this.props.componentId}/>
                  </View>
            } /> 
          </ImageBackground>
        </ThemeWrapper>
    );
  }
}



const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 10,
      paddingBottom: 10,
      marginBottom: 57,
      marginLeft: 15,
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
    posts: state.Api.posts || []
  }),
  (dispatch) => ({
    reloadChannels: bindActionCreators(apiActions.reloadAllChannels, dispatch),
    searchContent: bindActionCreators(apiActions.newSearch, dispatch)
})
  
)(HomeContainer)