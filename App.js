//npm install twrnc
//npm install react-native-heroicons react-native-svg
//npm install --save lodash
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, TextInput, Image } from 'react-native';
import tw from 'twrnc';
import {MagnifyingGlassIcon, CalendarDaysIcon} from 'react-native-heroicons/outline';
import React, { useState } from 'react';
import {MapPinIcon} from 'react-native-heroicons/solid';
import {debounce} from 'lodash';
import {fetchLocations, fetchWeatherForecast} from './api/weather'

export default function App() {

  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([1,2,3]);
  const [weather, setWeather] = useState({});
  const handleLocation = (loc)=> {
    //console.log('ciudad', loc); //indica en cual objeto de la lista(map) se hace click
    toggleSearch(false);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '6'
    }).then (data=> {
      setWeather(data);
      console.log("Los datos del tiempo de esta ciudad: ", data);
    })
  }
  const handleSearch = search => {
    //console.log('Valores de la búsqueda: ', search);
    if (search && search.length > 2) {
      fetchLocations({cityName: search}).then(data=>{
        console.log('Datos de la locación: ', data);
        setLocations(data);
      });
    }
  }
  //Para que no se cuelgue el dispositivo especialemente en celulares de muy baja gama(importando LODASH):
  //const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

  const {current, location, forecast} = weather;
  //Si son más de las 12:00, mostará el sunrise_time del día siguiente:
  const sunrises = forecast?.forecastday[0]?.hour[0]?.time_epoch + 43200; 
  
  return (
    <View style={tw`flex-1 relative`}>
      <StatusBar style="light" />
      <Image source={require('./assets/images/bg.png')} style={tw`absolute h-full w-full`} blurRadius={70}/>
      <SafeAreaView style={tw`flex flex-1`}>
        <View style={tw`mx-4 relative z-50`}>
          <View style={tw`flex-row items.center h-12 bg-neutral-300 rounded-full mt-11 flex justify-between`}>
            
            {
              showSearch?(
                <TextInput 
                onChangeText={handleSearch}
                placeholder='Buscar ciudad' 
                placeholderTextColor={'gray'}
                style={tw`text-white pl-6 h-10 flex-1 text-base`}/>
              ): null
            }            
            
            <TouchableOpacity style={tw`rounded-full p-1 m-1 bg-white flex justify-center items-center`} 
            onPress={()=> toggleSearch(!showSearch)}>
              <MagnifyingGlassIcon size='25' color='black'/>
            </TouchableOpacity>
          </View>
          {
            locations.length>0 && showSearch?(
              <View style={tw`absolute w-full bg-gray-300 top-16 rounded-3xl mt-10`}>
                {
                  locations.map((loc, index)=> {
                    let showborder = index + 1 != locations.length;
                    if (showborder){  
                      return(
                        <TouchableOpacity key={index} 
                        style={tw`flex-row items-center border-0 p-3 px-4 mb-1 border-b-2, border-b-gray-400`}
                        onPress={()=> handleLocation(loc)}>
                          <MapPinIcon size='20' color='gray'/>
                          <Text style={tw`text-black text-lg ml-2`}>
                            {loc?.name},{loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                    else{
                      return(
                        <TouchableOpacity key={index} 
                        style={tw`flex-row items-center border-0 p-3 px-4 mb-1`}
                        onPress={()=>handleLocation(loc)}>
                          <MapPinIcon size='20' color='gray'/>
                          <Text style={tw`text-black text-lg ml-2`}>
                            {loc?.name},{loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  })
                }
              </View>
            ): null
          }
        </View>
        <View style={tw`flex justify-around flex-1 mb-5`}>
          <Text style={tw`text-white text-center text-2xl font-bold`}>
            {location?.name}
            <Text style={tw`text-lg font-semibold text-gray-300`}>
              {" "+location?.country}
            </Text>
          </Text>
          <Text style={tw`text-m text-center font-semibold text-gray-300`}>
            {location?.localtime}
          </Text>
          <View style={tw`flex-row justify-center`}>
            <Image source={{uri: 'https:'+current?.condition?.icon}} 
            style={tw`w-52 h-52`}/>
          </View>
          <View>
            <Text style={tw`text-center text-6xl text-white ml-5`}>
              {current?.temp_c+"°C"}
            </Text>
            <Text style={tw`text-center text-white ml-5 tracking-widest`}>
              {current?.condition?.text}
            </Text>
          </View>
          <View style={tw`flex-row justify-between mx-4`}>
            <View style={tw`flex-row space-x-2 items-center`}>
              <Image source={require('./assets/icons/wind.png')}
              style={tw`h-6 w-6`} />
              <Text style={tw`text-wihte font-semibold text-base`}>
                {current?.wind_kph+" km/hr"}
              </Text>
            </View>
            <View style={tw`flex-row space-x-2 items-center`}>
              <Image source={require('./assets/icons/drop.png')}
              style={tw`h-6 w-6`} />
              <Text style={tw`text-wihte font-semibold text-base`}>
                {current?.humidity+" %"}
              </Text>
            </View>
            <View style={tw`flex-row relative space-x-2 items-center`}>
              <Image source={require('./assets/icons/sun.png')}
              style={tw`h-6 w-6`} />
              {
                location?.localtime_epoch > sunrises?(
                  <Text style={tw`text-wihte font-semibold text-base`}>
                    {"Mañana: "+forecast?.forecastday[1]?.astro?.sunrise}
                  </Text>
                ): 
                  <Text style={tw`text-wihte font-semibold text-base`}>
                    {"Hoy: "+forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
              }
            </View>
          </View>
        </View>
        <View style={tw`mb-5 space-y-1`}>
          <View style={tw`flex-row items-center mx-5 space-x-2`}>
            <CalendarDaysIcon size='22' color='white'/>
            <Text style={tw`text-white text-base`}>
              Tiempo Diario +5 días
            </Text>
          </View>
          <View style={tw`flex-row justify-around mx-5 space-x-2`}>
              <View>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[1]?.date.substring(5,10)}
                </Text>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[1]?.day?.avgtemp_c + "°C"}
                </Text>
                <Image source={{uri: 'https:'+forecast?.forecastday[1]?.day?.condition?.icon}} 
                style={tw`w-8 h-8`}/>
              </View>
              <View>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[2]?.date.substring(5,10)}
                </Text>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[2]?.day?.avgtemp_c + "°C"}
                </Text>
                <Image source={{uri: 'https:'+forecast?.forecastday[1]?.day?.condition?.icon}} 
                style={tw`w-8 h-8`}/>
              </View>
              <View>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[3]?.date.substring(5,10)}
                </Text>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[3]?.day?.avgtemp_c + "°C"}
                </Text>
                <Image source={{uri: 'https:'+forecast?.forecastday[1]?.day?.condition?.icon}} 
                style={tw`w-8 h-8`}/>
              </View>
              <View>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[4]?.date.substring(5,10)}
                </Text>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[4]?.day?.avgtemp_c + "°C"}
                </Text>
                <Image source={{uri: 'https:'+forecast?.forecastday[1]?.day?.condition?.icon}} 
                style={tw`w-8 h-8`}/>
              </View>
              <View>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[5]?.date.substring(5,10)}
                </Text>
                <Text style={tw`text-wihte font-semibold text-base`}>
                  {forecast?.forecastday[5]?.day?.avgtemp_c + "°C"}
                </Text>
                <Image source={{uri: 'https:'+forecast?.forecastday[1]?.day?.condition?.icon}} 
                style={tw`w-8 h-8`}/>
              </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
