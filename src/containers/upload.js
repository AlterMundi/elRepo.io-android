import React, { Component } from "react";
import { View , ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux"
import { TextInput, Button , Text} from 'react-native-paper';
import { AppBar  } from "../components/appbar";
import { bindActionCreators } from "redux";
import apiActions from "../redux/api/actions"
import { fileUploader } from '../helpers/fileUploader'
import { Navigation } from "react-native-navigation";


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
        setTimeout(()=>{
            this.setState({uploading: !this.state.uploading});
            Navigation.push('App', {
                component: { name: 'elRepoIO.home' },
              })
        }, 3000)
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
                {this.state.uploading
                ? (
                    <View style={styles.loading}>
                        <Text>Publicando contenido</Text>
                        <Button icon="" loading></Button>
                    </View>
                )
                 : (<ScrollView style={styles.scrollView}>
                    <View style={styles.content}>
                        <TextInput
                                onChangeText={(title)=>this.setState({title})}
                                value={this.state.title}
                                style={styles.input}
                                label='Título'
                            />
                        <TextInput
                            onChangeText={(description)=>this.setState({description})}
                            value={this.state.description}
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
                            onPress={this.publish}>
                                Publicar
                        </Button>
                    </View>
                 </ScrollView>) }
            </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    scrollView: {
        flex: 1,
        flexDirection: 'column',
    },
    content: {
      padding: 16,
    },
    loading: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
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