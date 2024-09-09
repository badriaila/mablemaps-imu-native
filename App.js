import React, { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';
import { Alert } from 'react-native';
import Dialog from "react-native-dialog";



export default function Compass() {
  const [magnetometerData, setMagnetometerData] = useState([]);
  const [accelerometerData, setAccelerometerData] = useState([]);
  const [gyroscopeData, setGyroscopeData] = useState([]);
  
  const [subscription, setSubscription] = useState(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [numOfSteps, setNumOfSteps] = useState(0);



  const _slow = () => {
    Accelerometer.setUpdateInterval(2000);
    Magnetometer.setUpdateInterval(2000);
    Gyroscope.setUpdateInterval(2000);
  }

  const _medium = () => {
    Accelerometer.setUpdateInterval(1000);
    Magnetometer.setUpdateInterval(1000);
    Gyroscope.setUpdateInterval(1000);
  }

  const _fast = () => {
    Accelerometer.setUpdateInterval(1);
    Magnetometer.setUpdateInterval(1);
    Gyroscope.setUpdateInterval(1);
  }

  let accelerometerUpdates = 0;
  let magnetometerUpdates = 0;
  let gyroscopeUpdates = 0;
  
  const _subscribe = () => {
    const newSubscriptions = [
      Accelerometer.addListener(newAccelerometerData => {
        accelerometerUpdates++;
        if (accelerometerUpdates % 10 === 0) {
          setAccelerometerData(prevAccelerometerData => [...prevAccelerometerData, newAccelerometerData]);
        }
      }),
  
      Magnetometer.addListener(newMagnetometerData => {
        magnetometerUpdates++;
        if (magnetometerUpdates % 10 === 0) {
          setMagnetometerData(prevMagnetometerData => [...prevMagnetometerData, newMagnetometerData]);
        }
      }),
  
      Gyroscope.addListener(newGyroscopeData => {
        gyroscopeUpdates++;
        if (gyroscopeUpdates % 10 === 0) {
          setGyroscopeData(prevGyroscopeData => [...prevGyroscopeData, newGyroscopeData]);
        }
      }),
    ];
  
    setSubscription(newSubscriptions);
  };


  const _unsubscribe = () => {
    if (Array.isArray(subscription)) {
      subscription.forEach((sub) => {
        console.log('Unsubscribing from:', sub);
        sub && sub.remove();
      });
    } else {
      console.log('Unsubscribing from:', subscription);
      subscription && subscription.remove();
    }
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);


  const sendData = async () => {
    _unsubscribe();
    console.log('Sending Data...');
    setDialogVisible(true);
  };

  const handleCancel = () => {
    setDialogVisible(false);
  };

  const handleOk = async () => {
    setDialogVisible(false);
    // Now you can use numOfSteps in your data
    const serverUrl = 'http://128.180.100.88:5000/data';
    const data = {
      accelerometerData: accelerometerData,
      gyroscopeData: gyroscopeData,
      magnetometerData: magnetometerData,
      steps: numOfSteps,
    };
      
      try{

        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();
        console.log('Response:', responseData);

      }catch(err){
        console.log('Something went wrong!', err);
      }

      setAccelerometerData([]);
      setGyroscopeData([]);
      setMagnetometerData([]);
  };



  // const sendData = async () => {
  //   _unsubscribe();
  //   console.log('Sending Data...');

  //   let numOfSteps = 0;

  //   Alert.prompt(
  //     "Step Count",
  //     "Please enter the number of steps you took:",
  //     [
  //       {
  //         text: "Cancel",
  //         style: "cancel"
  //       },
  //       {
  //         text: "OK",
  //         onPress: steps => numOfSteps = parseInt(steps)
  //       }
  //     ],
  //     'plain-text'
  //   );

  //   const serverUrl = 'http://128.180.100.88:5000/data';
  //   const data = {
  //     accelerometerData: accelerometerData,
  //     gyroscopeData: gyroscopeData,
  //     magnetometerData: magnetometerData,
  //   };
  //   console.log('Data:', data);

  //   try{

  //     const response = await fetch(serverUrl, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     const responseData = await response.json();
  //     console.log('Response:', responseData);

  //   }catch(err){
  //     console.log('Something went wrong!', err);
  //   }

  //   // console.log('Accelerometer Data: ', accelerometerData);
  //   // console.log('Gyroscope Data: ', gyroscopeData);
  //   // console.log('Magnetometer Data: ', magnetometerData);
  // }

  return (
    <View style={styles.container}>

      {/* <Text style={styles.text}>Magnetometer:</Text>
      {magnetometerData.map(({ x, y, z }, index) => (
        <View key={index}>
          <Text style={styles.text}>x: {x}</Text>
          <Text style={styles.text}>y: {y}</Text>
          <Text style={styles.text}>z: {z}</Text>
        </View>
      ))} */}

      <View style={styles.buttonContainer}>
        <Button title='Start' onPress={_subscribe}/>
        <Button title='Send Data' onPress={sendData}/>
      </View>

      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Step Count</Dialog.Title>
        <Dialog.Description>
          Please enter the number of steps you took:
        </Dialog.Description>
        <Dialog.Input onChangeText={setNumOfSteps}></Dialog.Input>
        <Dialog.Button label="Cancel" onPress={handleCancel} />
        <Dialog.Button label="OK" onPress={handleOk} />
      </Dialog.Container>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_medium} style={[styles.button, styles.middleButton]}>
          <Text>Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});

