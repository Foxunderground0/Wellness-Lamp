/**
 * MP3Controller BLE service.
 *
 * Scans for a BLE device named "MP3Controller", connects, and writes
 * JSON commands to the same characteristic layout as the WellnessLamp.
 *
 * Commands understood by the ESP32 firmware:
 *   {"cmd":"play","file":1}
 *   {"cmd":"volume","level":25}      // 0-30
 *   {"cmd":"stop"}
 *   {"cmd":"pause"}
 *   {"cmd":"resume"}
 *   {"cmd":"next"}
 *   {"cmd":"previous"}
 *   {"cmd":"playFolder","folder":2,"file":1}
 */

import {BleManager, Device, State} from 'react-native-ble-plx';
import {PermissionsAndroid, Platform} from 'react-native';

const SERVICE_UUID  = '12345678-1234-1234-1234-123456789abc';
const CMD_UUID      = '12345678-1234-1234-1234-123456789abd';
const DEVICE_NAME   = 'MP3Controller';
const SCAN_TIMEOUT  = 12000;

export type Mp3Result = 'ok' | 'timeout' | 'error' | 'no_bluetooth' | 'no_permission';

export type Mp3Command =
  | {cmd: 'play';       file: number}
  | {cmd: 'volume';     level: number}
  | {cmd: 'stop'}
  | {cmd: 'pause'}
  | {cmd: 'resume'}
  | {cmd: 'next'}
  | {cmd: 'previous'}
  | {cmd: 'playFolder'; folder: number; file: number};

const manager = new BleManager();
let connectedDevice: Device | null = null;

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') {return true;}
  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]    === 'granted' &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted'
    );
  }
  const r = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return r === 'granted';
}

async function connectToDevice(): Promise<Device | null> {
  const state = await manager.state();
  if (state !== State.PoweredOn) {return null;}

  return new Promise(resolve => {
    const timer = setTimeout(() => {
      manager.stopDeviceScan();
      resolve(null);
    }, SCAN_TIMEOUT);

    manager.startDeviceScan(null, {allowDuplicates: false}, async (err, device) => {
      if (err || !device) {return;}
      if (device.name !== DEVICE_NAME) {return;}

      manager.stopDeviceScan();
      clearTimeout(timer);

      try {
        const connected = await device.connect({requestMTU: 256});
        await connected.discoverAllServicesAndCharacteristics();
        connectedDevice = connected;
        console.log('[MP3-BLE] connected to', device.name);
        resolve(connected);
      } catch (e) {
        console.log('[MP3-BLE] connect error:', e);
        connectedDevice = null;
        resolve(null);
      }
    });
  });
}

async function ensureConnected(): Promise<Device | null> {
  if (connectedDevice) {
    try {
      const ok = await connectedDevice.isConnected();
      if (ok) {return connectedDevice;}
    } catch {}
    connectedDevice = null;
  }
  return connectToDevice();
}

export async function sendMp3Command(cmd: Mp3Command): Promise<Mp3Result> {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {return 'no_permission';}

  const bleState = await manager.state();
  if (bleState !== State.PoweredOn) {return 'no_bluetooth';}

  const device = await ensureConnected();
  if (!device) {return 'timeout';}

  try {
    const json   = JSON.stringify(cmd);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    await device.writeCharacteristicWithResponseForService(SERVICE_UUID, CMD_UUID, base64);
    console.log('[MP3-BLE] sent:', json);
    return 'ok';
  } catch (e) {
    console.log('[MP3-BLE] write error:', e);
    connectedDevice = null;
    return 'error';
  }
}

export async function disconnectMp3(): Promise<void> {
  if (connectedDevice) {
    try {await connectedDevice.cancelConnection();} catch {}
    connectedDevice = null;
  }
}

export function isMp3Connected(): boolean {
  return connectedDevice !== null;
}
