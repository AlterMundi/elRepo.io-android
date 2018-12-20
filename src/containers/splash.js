import React, { Component } from "react";
import {  Animated, Dimensions, Easing, Text, StyleSheet, ImageBackground} from "react-native";
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { Navigation } from "react-native-navigation";
import { ThemeWrapper } from "../components/wrapper";


const background = require('../assets/background.png');
const logo = require('../assets/logo.png');

const window = Dimensions.get('window');


class SplashContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
          _width: new Animated.Value(1),
          _rotation: new Animated.Value(0),
        }
        this.spin = this.spin.bind(this)
    }
  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
    }

    spin() {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(this.state._width, {
              toValue: 1.3,
              easing: Easing.bounce,
              duration: 2000,
              useNativeDriver: true
            }),
            Animated.timing(this.state._width, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true
            })
          ]),
          Animated.sequence([
            Animated.timing(this.state._rotation, {
              toValue: 1,
              duration: 1400,
              useNativeDriver: true
            }),
            Animated.timing(this.state._rotation, {
              toValue: 0,
              duration: 1200,
              delay: 600,
              useNativeDriver: true
            })
          ])
        ])
      ).start()
    }

    componentWillMount() {
        this.spin()
    }

    goHome() {
      setTimeout(()=>{
        Navigation.setRoot({
          root: {
              sideMenu: {
                  id: "SideMenu",
                  right: {
                      component: {
                          id: "DownloadStatus",
                          name: "elRepoIO.downloadStatus"
                      }
                    },
                  left: {
                    component: {
                        id: "Drawer",
                        name: "navigation.elRepoIO.drawer"
                    }
                  },
                  center: {
                      stack: {
                          id:'App',
                          children: [{
                              component: {
                                  name: "elRepoIO.home",
                              }
                          }]
                      }, 
                  }
              }
          }
      })
      },10000)
    }

    componentWillReceiveProps(newProps) {
      if(newProps.login === true) {
        this.goHome();
      }
    }
  
  render() {
    const spin = this.state._rotation.interpolate({
      inputRange: [0,1],
      outputRange: ['-29deg', '390deg']
    })
    let transformStyle = { transform: [{ scale: this.state._width}, { rotate:spin}] };
    return (
      <ThemeWrapper>
        <ImageBackground  resizeMode="repeat" source={background}   style={{flex: 1, width: '100%', height: '100%', flexDirection: 'column', justifyContent:'center', alignContent:'center'}}>
                  <Animated.Image  source={logo} style={[styles.logo,transformStyle]}/>
                   <Text style={{textAlign:'center'}}>{this.props.status}</Text>
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
    logo: {
      marginLeft: window.width/2-30,
      marginBottom: 20,
      width: 60,
      height: 60
    }
  });
  


export const Splash = connect(
  (state) => ({
    status: state.Api.status || '',
    login: state.Api.login
  }),
  (dispatch) => ({
})
  
)(SplashContainer)