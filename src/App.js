import React, { Component } from "react";
import { StatusBar, View } from "react-native";
import { Home } from "./containers/home";



export default class App extends Component {
  componentDidMount() {
    StatusBar.setBarStyle('light-content')
  }
  render() {
    return (
     
          <View>
            <Home/>
          </View>
    );
  }
}