/**
 * WellnessLamp BLE service.
 *
 * Scans for a BLE device named "WellnessLamp", connects, and writes a
 * single JSON command.  The lamp runs independently after receiving it.
 *
 * Speed sync: the app passes its current animation position (tRef) as
 * "startT" so the lamp starts from the exact same gradient position.
 *
 * Pair once — the device stays connected between sends.
 */

import {BleManager, Device, State} from 'react-native-ble-plx';
import {PermissionsAndroid, Platform} from 'react-native';

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CMD_UUID     = '12345678-1234-1234-1234-123456789abd';
const DEVICE_NAME  = 'WellnessLamp';
const SCAN_TIMEOUT = 12000; // ms

export type LampResult = 'ok' | 'timeout' | 'error' | 'no_bluetooth' | 'no_permission';

export interface LampCommand {
  mode: 'static' | 'immersive';
  color?: string;
  colors?: string[];
  speed?: number;
  brightness: number;
  startT: number; // current animation position — syncs lamp with app orb
}

// ── BLE manager (singleton) ───────────────────────────────────────────────────
const manager = new BleManager();
let connectedDevice: Device | null = null;

// ── permissions ───────────────────────────────────────────────────────────────
async function requestBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') { return true; }
  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    return (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN]  === 'granted' &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === 'granted'
    );
  } else {
    const r = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return r === 'granted';
  }
}

// ── scan + connect ────────────────────────────────────────────────────────────
async function connectToLamp(): Promise<Device | null> {
  // Check BLE state
  const state = await manager.state();
  if (state !== State.PoweredOn) { return null; }

  return new Promise(resolve => {
    const timer = setTimeout(() => {
      manager.stopDeviceScan();
      resolve(null);
    }, SCAN_TIMEOUT);

    manager.startDeviceScan(null, {allowDuplicates: false}, async (err, device) => {
      if (err || !device) { return; }
      if (device.name !== DEVICE_NAME) { return; }

      manager.stopDeviceScan();
      clearTimeout(timer);

      try {
        const connected = await device.connect({requestMTU: 512});
        await connected.discoverAllServicesAndCharacteristics();
        connectedDevice = connected;
        console.log('[BLE] connected to', device.name, 'MTU requested: 512');
        resolve(connected);
      } catch (e) {
        console.log('[BLE] connect error:', e);
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
      if (ok) { return connectedDevice; }
    } catch {}
    connectedDevice = null;
  }
  return connectToLamp();
}

// ── public API ────────────────────────────────────────────────────────────────

export async function sendToLamp(cmd: LampCommand): Promise<LampResult> {
  // Permissions first
  const hasPermission = await requestBluetoothPermissions();
  if (!hasPermission) { return 'no_permission'; }

  // BLE state check
  const bleState = await manager.state();
  if (bleState !== State.PoweredOn) { return 'no_bluetooth'; }

  const device = await ensureConnected();
  if (!device) { return 'timeout'; }

  try {
    const json    = JSON.stringify(cmd);
    // react-native-ble-plx expects base64 — it decodes before sending raw bytes
    const base64  = btoa(unescape(encodeURIComponent(json)));
    await device.writeCharacteristicWithResponseForService(
      SERVICE_UUID, CMD_UUID, base64,
    );
    console.log('[BLE] sent:', json);
    return 'ok';
  } catch (e) {
    console.log('[BLE] write error:', e);
    connectedDevice = null;
    return 'error';
  }
}

export async function disconnectLamp(): Promise<void> {
  if (connectedDevice) {
    try { await connectedDevice.cancelConnection(); } catch {}
    connectedDevice = null;
  }
}

export function isLampConnected(): boolean {
  return connectedDevice !== null;
}
