/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * https://www.smashingmagazine.com/2016/04/the-beauty-of-react-native-building-your-first-ios-app-with-javascript-part-1/
 * @flow
 */

import { AppRegistry, StyleSheet, Text, View, ActivityIndicatorIOS } from 'react-native';
import RandManager from './RandManager';
import React, { Component } from 'react';
import Swiper from 'react-native-swiper';

const NUM_WALLPAPERS = 5;

class SplashWalls extends Component {

    constructor(props) {
        super(props);

        this.state = {
          wallsJSON: [],
          isLoading: true
        };
    }

    componentDidMount() {
        this.fetchJallsJSON();
    }

    fetchJallsJSON() {
        var url = 'https://unsplash.it/list';
        fetch(url)
          .then( response => response.json() )
          .then( jsonData => {
            var randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
            var walls = [];
            randomIds.forEach(randomId => {
              walls.push(jsonData[randomId]);
            });

            this.setState({
              isLoading: false,
              wallsJSON: [].concat(walls)
            });
          })
          .catch( error => console.log('JSON Fetch error : ' + error) );
    }

    renderLoadingMessage() {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicatorIOS
                  animating={true}
                  color={'#999'}
                  size={'small'}
                  style={{margin: 15}} />
                  <Text style={{color: '#fff'}}>Contacting Unsplash</Text>

            </View>
        );
    }

    renderResults() {
        var {wallsJSON, isLoading} = this.state;
        if( !isLoading ) {
            return (
                <Swiper onMomentumScrollEnd={this.onMomentumScrollEnd}>
                    {wallsJSON.map((wallpaper, index) => {
                        console.log(wallpaper);
                        const styles = StyleSheet.create({
                            slide: {
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#9DD6EB',
                            },
                            text: {
                                color: '#999',
                                fontSize: 30,
                                fontWeight: 'bold',
                            }
                        });
                        return(
                            <View key={index}>
                                <Text style={styles.text}>
                                    {wallpaper.author}
                                </Text>
                            </View>
                        );
                    })}
                </Swiper>
            );
        }
    }

    render() {
        var { isLoading } = this.state;
        if (isLoading)
            return this.renderLoadingMessage();
        else
            return this.renderResults();
    }
}

const slideStyles = StyleSheet.create({
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);
