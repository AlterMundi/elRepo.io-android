import React, { Component } from "react";
import { View , ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux"
import { TextInput, Button } from 'react-native-paper';
import { AppBar  } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { fileUploader } from '../helpers/fileUploader'


class UploadContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: undefined,
            description: undefined,
            files: [],
            uploading: false,
        }
        this.publish = this.publish.bind(this);
        this.selectFiles = this.selectFiles.bind(this);
    }

  static options (passProps) {
      return {
          topBar: {
              visible: false,
              height: 0
          }
      }
    }
  
    publish() {
        this.props.publish({
            title: this.state.title || '',
            description: this.state.description || '',
            files: this.state.files || []
        })

    //Fake loading status
        this.setState({uploading: !this.state.uploading})
        setTimeout(()=>this.setState({uploading: !this.state.uploading}), 1000)
    }

    selectFiles() {
        fileUploader.openDialog()
            .then((selected) => fileUploader.shareFiles({files: selected.files, destination: this.props.sharedFolder}))
            .then(filesInfo => this.setState({files: [...filesInfo, ...this.state.files]}))
    }

  render() {
    return (
          <View  style={styles.container}>
              <AppBar title={'elRepo.io'} subtitle={'Publicar contenido'} />
              <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <TextInput
                            style={styles.input}
                            label='Título'
                        />
                    <TextInput
                        style={styles.input}
                        label='Descripción'
                        numberOfLines={4}
                    />
                    
                    <Button 
                        style={styles.input}
                        icon="file-upload"
                        mode="contained"
                        onPress={() => console.log('Pressed')}>
                            Agregar archivos
                    </Button>

                    <Button 
                        mode={"outlined"}
                        icon="share"
                        onPress={() => console.log('Pressed')}>
                            Publicar
                    </Button>
                </View>
              </ScrollView>  
          </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    input: {
      marginBottom: 16,
    },
  });
  
export const Upload = connect(
    state => ({
        sharedFolder: state.Api.folder.filename,
    }),
    dispatch => ({
        publish: bindActionCreators(apiActions.createPost, dispatch)
    })
  
)(UploadContainer)