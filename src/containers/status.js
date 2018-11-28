import React, { Component } from "react";
import { View , ScrollView, StyleSheet} from "react-native";
import { connect } from "react-redux"
import {  Text, Paragraph, Title, Card } from 'react-native-paper';
import { AppBar, } from "../components/appbar";

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
          <View>
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
          </View>
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
    card: {
      margin: 8,
    },
  });
  


export const Status = connect(
  (state) => ({
    stauts: state.Api.login? 'Listo': 'Iniciando',
    userId: state.Api.user? state.Api.user.mLocationName: '',
    friends: state.Api.peers? state.Api.peers : [],
    
  }),
  (dispatch) => ({
})
  
)(StatusContainer)