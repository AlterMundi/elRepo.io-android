import React, { Component } from "react";
import {  Animated, Dimensions, Easing, Text, StyleSheet, ImageBackground} from "react-native";
import { connect } from "react-redux"
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { Navigation } from "react-native-navigation";
import { ThemeWrapper } from "../components/wrapper";
import { Button } from "react-native-paper";
import { NativeModules } from 'react-native'

const { RetroShareIntent } = NativeModules;

const background = require('../assets/background.png');
const logo = require('../assets/logo.png');

const window = Dimensions.get('window');


class SplashContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
          _width: new Animated.Value(1),
          _rotation: new Animated.Value(0),
          loading: false
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
        //Animated.parallel([
          Animated.sequence([
            Animated.timing(this.state._width, {
              toValue: 1.6,
              easing: Easing.bounce,
              duration: 3000,
              useNativeDriver: true
            }),
            Animated.timing(this.state._width, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true
            })
          ])
        //   ,
        //   Animated.sequence([
        //     Animated.timing(this.state._rotation, {
        //       toValue: 1,
        //       duration: 1400,
        //       useNativeDriver: true
        //     }),
        //     Animated.timing(this.state._rotation, {
        //       toValue: 0,
        //       duration: 1200,
        //       delay: 600,
        //       useNativeDriver: true
        //     })
        //   ])
        // ])
      ).start()
    }

    componentWillMount() {
        this.spin()
    }

    goHome() {
        Navigation.setRoot({
          root: {
              sideMenu: {
                  id: "SideMenu",
                  right: {
                      visible: false,
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
    }

    componentWillReceiveProps(newProps) {
      if(newProps.login === true && this.props.login === false) {
        this.goHome();
      }
    }
  reconect() {
    this.setState({loading: true})
    setTimeout(()=> {
      this.props.reconect();
      this.setState({loading: false});
    }, 4000)
  }
  render() {
    // const spin = this.state._rotation.interpolate({
    //   inputRange: [0,1],
    //   outputRange: ['-29deg', '390deg']
    // })

    let  move = this.state._width.interpolate({
      inputRange: [1,1.6],
      outputRange: [0, (60*1.6)/2-60]
    })
    let transformStyle = { transform: [{ scale: this.state._width}, {translateY: move }/*, { rotate:spin}*/] };
    return (
      <ThemeWrapper>
        <ImageBackground  resizeMode="repeat" source={background}   style={{flex: 1, flexDirection: 'column', justifyContent:'center', alignContent:'center'}}>
                  <Animated.Image  source={logo} style={[styles.logo,transformStyle]}/>
                   <Text style={{textAlign:'center'}}>{this.props.status}</Text>
                   {this.props.status === 'Error al intentar iniciar el servicio'
                    ? <Button 
                      loading={this.state.loading}
                      onPress={()=> !this.state.loading?RetroShareIntent.startService()
                          .then(this.reconect.bind(this))
                          .catch(()=> console.warn('Error starting RetroShare')): false
                      }
                      mode="contained"
                      dark={true}
                      style={{marginTop: 30, width: 200, marginLeft: (window.width-200)/2}}>
                        Volver a intentar
                      </Button>
                    : false
                  }
          </ImageBackground>
        </ThemeWrapper>
    );
  }
}



const styles = StyleSheet.create({
    container: {
      flex: 1
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
    reconect: () => dispatch({type: 'CONNECT'})
})
  
)(SplashContainer)