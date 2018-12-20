import React, { Component } from "react";
import { View } from "react-native";
import { Home } from "./containers/home";



export default class App extends Component {
  componentDidMount() {
  }
  render() {
    return (
     
          <View>
            <Home/>
          </View>
    );
  }
}