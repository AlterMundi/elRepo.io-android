import React, { Component } from "react";
import { View , ScrollView, StyleSheet} from "react-native";
import { connect } from "react-redux"
import {  Text, Paragraph, Title, Card, Button } from 'react-native-paper';
import { AppBar, } from "../components/appbar";
import { NSD } from 'react-native-nsd';
import { Handshake}  from 'react-native-handshake'
import { ThemeWrapper } from '../components/wrapper';

class StatusContainer extends Component {
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
              <AppBar  title={'elRepo.io'} subtitle={'Estado de conexiones'}/>
                <Card  style={styles.card}>
                    <Card.Content>
                        <Title>Estado</Title>
                        <Paragraph> {this.props.stauts}</Paragraph>
                        <Title>Id de usuario</Title>
                        <Paragraph> {this.props.userId}</Paragraph>
                        <Title>Contactos:</Title> 
                            { this.props.friends.map(friend => (
                                <Text key={friend.id}>{friend.name} ({friend.status === true ? 'online': 'offline' })</Text>
                            )) }
                    </Card.Content>
                </Card>
                <Button dark={true} style={styles.button} mode="contained" onPress={()=>NSD.discover()} >Discover</Button>
                <Button dark={true} style={styles.button}  mode="contained" onPress={()=>{Handshake.startServer(this.props.cert)}}>Srart server</Button>
                <Button dark={true} style={styles.button}  mode="contained" onPress={()=>{Handshake.stopServer()}}>Stop server</Button>
                <Button dark={true} style={styles.button}  mode="contained" onPress={()=>NSD.stopDiscovery()}>Stop Discovery</Button>
          </ThemeWrapper>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: '100%'
    },
    content: {
      padding: 4,
    },
    button: {
      margin: 5
    },
    card: {
      margin: 8,
    },
  });
  


export const Status = connect(
  (state) => ({
    stauts: state.Api.login? 'Listo': 'Iniciando',
    cert: (state.Api.cert || '').replace(/\n/g,'\\n')+'\n',
    userId: state.Api.user? state.Api.user.mLocationName: '',
    friends: state.Api.peers? state.Api.peers : [],
    
  }),
  (dispatch) => ({
})
  
)(StatusContainer)