import React, { Component } from "react";
import { View , Text, FlatList, StyleSheet , ImageBackground, Button } from "react-native";
import { connect } from "react-redux"
import { AppBar } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import {  ThemeWrapper } from  '../components/wrapper'
import { List } from 'react-native-paper';
import FileViewer from 'react-native-file-viewer';

const background = require('../assets/background.png');

class FilesContainer extends Component {
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


  componentWillMount() {
    this.props.loadFiles();
    this.loader = setInterval(this.props.loadFiles, 20000);
  }

  componentWillUnmount() {
    clearInterval(this.loader);
  }
  
  render() {
    return (
      <ThemeWrapper>
          <View style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Archivos descargados'} />
                <ImageBackground  resizeMode="repeat" source={background}   style={{width: '100%', height: '100%'}}>
                    <FlatList
                      data={this.props.files}
                      renderItem={({item}) => (
                        <List.Item
                        style={{backgroundColor:'rgb(240,240,240)', margin: 10, marginBottom: 0, borderRadius: 3}}
                        title={item.name}
                        onPress={()=>FileViewer.open(item.path).then(console.log).catch(console.warn) }
                        left={props => <List.Icon {...props} icon="folder-open" />}
                      />
                      )
                    }
                    />
                        {
                          //this.props.files.map((x, key)=><Button key={key} title={x.filename} />)
                        }
                </ImageBackground>
          </View>
        </ThemeWrapper>
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
  


export const Files = connect(
  (state) => ({
    files: (state.Api.files || []).map(x => ({...x, key: x.handle.toString()}))
  }),
  (dispatch) => ({
    loadFiles: ()=> dispatch({type: 'LOAD_FILES'})
  })
)(FilesContainer);