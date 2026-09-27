/**
 * WellnessLamp — ESP32 BLE + ESP-NOW reliable synchronization
 *
 * Device name  : "WellnessLamp"
 * Service UUID : 12345678-1234-1234-1234-123456789abc
 * Cmd char     : 12345678-1234-1234-1234-123456789abd (WRITE)
 *
 * Libraries:
 *   Adafruit NeoPixel
 *   ArduinoJson v7
 */

#include <Arduino.h>

// Kept inline so this file needs no separate WellnessTypes.h
struct RGB {
  uint8_t r, g, b;
};

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>

#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>

#include <algorithm>
#include <math.h>
#include <string.h>


// ============================================================
// BLE UUIDs
// ============================================================

#define SERVICE_UUID "12345678-1234-1234-1234-123456789abc"

#define CMD_UUID "12345678-1234-1234-1234-123456789abd"


// ============================================================
// LED CONFIGURATION
// ============================================================

#define LED_PIN 16
#define NUM_LEDS 60

#define GAMMA 2.2f

#define CCR 255
#define CCG 190
#define CCB 220

#define TRANSITION_MS 550

#define MAX_PALETTE 8


// ============================================================
// ESP-NOW CONFIGURATION
// ============================================================

// Set to 0 to test the original BLE functionality without ESP-NOW.

#define ENABLE_ESPNOW 1

// All lamps must use the same Wi-Fi channel.

constexpr uint8_t ESPNOW_CHANNEL = 6;

// All lamps must use the same network ID.

constexpr uint32_t NETWORK_ID = 0x57A19E55;

constexpr uint32_t PACKET_MAGIC = 0x574C4D50;

// Schedule commands slightly into the future.

constexpr uint32_t START_DELAY_MS = 300;

// Minimum interval between certain radio transmissions.

constexpr uint32_t TRANSFER_GUARD_MS = 35;

// Discovery interval.

constexpr uint32_t PEER_HELLO_MS = 2500;

// Time before a previous authority is considered inactive.

constexpr uint32_t OWNER_LEASE_MS = 2500;

// Allow one additional forwarding hop.

constexpr uint8_t RELAY_HOPS = 1;


// ============================================================
// PACKET TYPES
// ============================================================

constexpr uint8_t PKT_HELLO   = 1;

constexpr uint8_t PKT_COMMAND = 2;

constexpr uint8_t PKT_STATE   = 3;

constexpr uint8_t PKT_ACK     = 4;


// ============================================================
// NEOPIXEL
// ============================================================

Adafruit_NeoPixel strip(
  NUM_LEDS,
  LED_PIN,
  NEO_GRB + NEO_KHZ800
);


// ============================================================
// ORIGINAL WELLNESSLAMP STATE
// ============================================================

bool immersiveMode = false;

float targetBrightness = 0.78f;

float currentBrightness = 0.78f;


// Default lavender color.

RGB renderedColor = {
  201, 184, 232
};


// Transition state.

RGB transitionFrom = {
  201, 184, 232
};

bool transitioning = false;

uint32_t transitionStart = 0;


// Static mode.

RGB targetStaticColor = {
  201, 184, 232
};


// Immersive mode.

RGB palette[MAX_PALETTE];

int paletteSize = 0;

float animSpeed = 1.0f;

float animT = 0.0f;


// LED rendering clock.

uint32_t lastLoopMs = 0;


// ============================================================
// COLOR MATH
// ============================================================

RGB hexToRGB(const char* hex) {

  if (!hex || hex[0] != '#' || strlen(hex) < 7) {
    return {0, 0, 0};
  }

  uint32_t v = strtoul(hex + 1, nullptr, 16);

  return {

    (uint8_t)((v >> 16) & 0xFF),

    (uint8_t)((v >> 8) & 0xFF),

    (uint8_t)(v & 0xFF)

  };

}


// ============================================================
// CATMULL-ROM SPLINE
// ============================================================

static float crSpline(

  float p0,
  float p1,
  float p2,
  float p3,
  float t

) {

  float t2 = t * t;

  float t3 = t2 * t;

  return 0.5f * (

    2 * p1 +

    (-p0 + p2) * t +

    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +

    (-p0 + 3 * p1 - 3 * p2 + p3) * t3

  );

}


// ============================================================
// SPLINE COLOR
// ============================================================

RGB splineColor(float pos) {

  int n = paletteSize;

  pos = fmod(pos, (float)n);

  if (pos < 0) {
    pos += n;
  }

  int i = (int)pos;

  float f = pos - i;


  RGB c0 = palette[(i - 1 + n) % n];

  RGB c1 = palette[i % n];

  RGB c2 = palette[(i + 1) % n];

  RGB c3 = palette[(i + 2) % n];


  auto cl = [](float v) -> uint8_t {

    return (uint8_t)constrain(
      (int)v,
      0,
      255
    );

  };


  return {

    cl(crSpline(c0.r, c1.r, c2.r, c3.r, f)),

    cl(crSpline(c0.g, c1.g, c2.g, c3.g, f)),

    cl(crSpline(c0.b, c1.b, c2.b, c3.b, f))

  };

}


// ============================================================
// EASING
// ============================================================

float easeInOut(float t) {

  return t * t * (3 - 2 * t);

}


// ============================================================
// RGB INTERPOLATION
// ============================================================

RGB lerpRGB(

  RGB a,
  RGB b,
  float t

) {

  return {

    (uint8_t)constrain(

      (int)a.r +

      (int)(((int)b.r - (int)a.r) * t),

      0,
      255

    ),

    (uint8_t)constrain(

      (int)a.g +

      (int)(((int)b.g - (int)a.g) * t),

      0,
      255

    ),

    (uint8_t)constrain(

      (int)a.b +

      (int)(((int)b.b - (int)a.b) * t),

      0,
      255

    )

  };

}


// ============================================================
// HSL HELPERS
// ============================================================

static float hue2rgb(

  float p,
  float q,
  float t

) {

  if (t < 0) {
    t += 1.0f;
  }

  if (t > 1) {
    t -= 1.0f;
  }

  if (t < 1 / 6.0f) {
    return p + (q - p) * 6.0f * t;
  }

  if (t < 1 / 2.0f) {
    return q;
  }

  if (t < 2 / 3.0f) {
    return p + (q - p) * (2 / 3.0f - t) * 6.0f;
  }

  return p;

}


// ============================================================
// RGB TO HSL
// ============================================================

static void rgbToHsl(

  uint8_t r,
  uint8_t g,
  uint8_t b,

  float &h,
  float &s,
  float &l

) {

  float rf = r / 255.0f;

  float gf = g / 255.0f;

  float bf = b / 255.0f;


  float mx = max({rf, gf, bf});

  float mn = min({rf, gf, bf});


  l = (mx + mn) * 0.5f;


  float d = mx - mn;


  if (d < 0.001f) {

    h = 0;

    s = 0;

    return;

  }


  s = (l > 0.5f)

    ? d / (2.0f - mx - mn)

    : d / (mx + mn);


  if (mx == rf) {

    h = (gf - bf) / d +

        (gf < bf ? 6.0f : 0.0f);

  }

  else if (mx == gf) {

    h = (bf - rf) / d + 2.0f;

  }

  else {

    h = (rf - gf) / d + 4.0f;

  }


  h /= 6.0f;

}


// ============================================================
// HSL TO RGB
// ============================================================

static RGB hslToRgb(

  float h,
  float s,
  float l

) {

  if (s < 0.001f) {

    uint8_t v = (uint8_t)(l * 255.0f);

    return {v, v, v};

  }


  float q = (l < 0.5f)

    ? l * (1 + s)

    : l + s - l * s;


  float p = 2 * l - q;


  return {

    (uint8_t)(hue2rgb(p, q, h + 1 / 3.0f) * 255.0f + 0.5f),

    (uint8_t)(hue2rgb(p, q, h) * 255.0f + 0.5f),

    (uint8_t)(hue2rgb(p, q, h - 1 / 3.0f) * 255.0f + 0.5f)

  };

}


// ============================================================
// ORIGINAL LED WRITING PIPELINE
// ============================================================

void writeAllLEDs(

  RGB c,
  float bright

) {

  float h, s, l;


  rgbToHsl(

    c.r,
    c.g,
    c.b,

    h,
    s,
    l

  );


  const float MIN_SAT = 0.75f;

  const float MAX_L = 0.62f;


  s = (s < MIN_SAT)

    ? MIN_SAT

    : s;


  l = (l > MAX_L)

    ? MAX_L

    : l;


  RGB v = hslToRgb(h, s, l);


  uint8_t r = (uint16_t)v.r * CCR / 255;

  uint8_t g = (uint16_t)v.g * CCG / 255;

  uint8_t b = (uint16_t)v.b * CCB / 255;


  uint8_t br = (uint8_t)(

    pow(

      constrain(bright, 0.0f, 1.0f),

      GAMMA

    ) * 255.0f + 0.5f

  );


  strip.setBrightness(br);


  strip.fill(

    strip.Color(r, g, b),

    0,

    NUM_LEDS

  );


  strip.show();


  renderedColor = c;

}


// ============================================================
// ORIGINAL APP JSON COMMAND HANDLER
// ============================================================

void processCommand(const char* json) {

  JsonDocument doc;


  if (deserializeJson(doc, json)) {

    Serial.println("[ble] bad json");

    return;

  }


  if (!doc["brightness"].isNull()) {

    targetBrightness = constrain(

      (float)doc["brightness"],

      0.05f,

      1.0f

    );

  }


  transitionFrom = renderedColor;

  transitionStart = millis();

  transitioning = true;


  const char* mode = doc["mode"] | "static";


  immersiveMode =

    (strcmp(mode, "immersive") == 0);


  if (immersiveMode) {


    if (!doc["speed"].isNull()) {

      animSpeed = constrain(

        (float)doc["speed"],

        0.1f,

        5.0f

      );

    }


    if (!doc["startT"].isNull()) {

      animT = (float)doc["startT"];

    }


    JsonArray colors =

      doc["colors"].as<JsonArray>();


    if (!colors.isNull() && colors.size() > 0) {

      paletteSize = 0;


      for (JsonVariant v : colors) {

        if (paletteSize < MAX_PALETTE) {

          palette[paletteSize++] =

            hexToRGB(

              v.as<const char*>()

            );

        }

      }

    }


    Serial.printf(

      "[lamp] immersive %d cols spd %.2f t=%.2f\n",

      paletteSize,

      animSpeed,

      animT

    );

  }

  else {


    targetStaticColor =

      hexToRGB(

        doc["color"] | "#c9b8e8"

      );


    Serial.printf(

      "[lamp] static #%02X%02X%02X\n",

      targetStaticColor.r,

      targetStaticColor.g,

      targetStaticColor.b

    );

  }

}


// ============================================================
// ESP-NOW PACKET STRUCTURE
// ============================================================

struct __attribute__((packed)) LampPacket {

  uint32_t magic;

  uint32_t network;

  uint8_t version;

  uint8_t kind;

  uint8_t origin[6];

  uint32_t bootId;

  uint32_t sequence;

  uint32_t eventId;

  int32_t elapsedMs;

  uint8_t immersive;

  uint8_t paletteCount;

  float brightness;

  float speed;

  float startPhase;

  RGB staticColor;

  RGB colors[MAX_PALETTE];

  uint8_t ttl;

};


static_assert(

  sizeof(LampPacket) <= ESP_NOW_MAX_DATA_LEN,

  "LampPacket exceeds ESP-NOW packet size"

);


// ============================================================
// RADIO MESSAGE
// ============================================================

struct RadioMessage {

  LampPacket packet;

  uint8_t linkMac[6];

  uint32_t receivedAt;

};


// ============================================================
// BLE MESSAGE
// ============================================================

struct BleMessage {

  char json[512];

};


// ============================================================
// QUEUES
// ============================================================

QueueHandle_t radioQueue = nullptr;

QueueHandle_t bleQueue = nullptr;


// ============================================================
// NETWORK STATE
// ============================================================

volatile bool phoneConnected = false;


bool radioReady = false;

bool syncActive = false;

bool iAmAuthority = false;


uint8_t ownMac[6] = {};

uint8_t authorityMac[6] = {};


uint8_t broadcastMac[6] = {

  255, 255, 255, 255, 255, 255

};


uint32_t bootId = 0;

uint32_t packetSequence = 0;

uint32_t eventId = 0;


uint32_t lastRadioTx = 0;

uint32_t lastBroadcast = 0;

uint32_t lastHello = 0;

uint32_t lastStats = 0;


uint32_t scheduledStart = 0;

uint32_t authorityLastHeard = 0;

uint32_t eventCreated = 0;


uint32_t currentAuthorityBoot = 0;

uint32_t lastAckSent = 0;


bool ackPending = false;

bool pendingNewPeer = false;


uint8_t newPeerMac[6] = {};


float phaseAtStart = 0;


uint32_t txOK = 0;

uint32_t txErr = 0;

uint32_t rxOK = 0;

uint32_t ackRX = 0;


volatile uint32_t callbackRX = 0;

volatile uint32_t queueDrops = 0;


// ============================================================
// PEER DISCOVERY
// ============================================================

constexpr int MAX_PEERS = 10;


struct Peer {

  bool used = false;

  uint8_t mac[6] = {};

  uint32_t lastSeen = 0;

  uint32_t ackEvent = 0;

  uint32_t ackBoot = 0;

  uint32_t lastAck = 0;

  uint32_t lastUnicast = 0;

};


Peer peers[MAX_PEERS];


// ============================================================
// DUPLICATE PACKET SUPPRESSION
// ============================================================

struct Seen {

  bool used = false;

  uint8_t mac[6] = {};

  uint32_t boot = 0;

  uint32_t sequence = 0;

};


Seen seen[16];

uint8_t seenCursor = 0;


// ============================================================
// EXPLICIT FUNCTION PROTOTYPES
//
// FIX FOR ARDUINO AUTOMATIC PROTOTYPE GENERATION
// ============================================================

Peer* recordPeer(

  const uint8_t *mac,

  uint32_t now

);


bool duplicate(

  const LampPacket &p

);


LampPacket makePacket(

  uint8_t kind,

  uint8_t ttl

);


bool sendRaw(

  const uint8_t *dest,

  const LampPacket &p

);


void sendAck(

  const LampPacket &pkt

);


void acceptState(

  const RadioMessage &m

);


// ============================================================
// MAC ADDRESS HELPERS
// ============================================================

bool sameMac(

  const uint8_t *a,

  const uint8_t *b

) {

  return memcmp(a, b, 6) == 0;

}


void macPrint(const uint8_t *a) {

  Serial.printf(

    "%02X:%02X:%02X:%02X:%02X:%02X",

    a[0],

    a[1],

    a[2],

    a[3],

    a[4],

    a[5]

  );

}


// ============================================================
// ENSURE ESP-NOW PEER EXISTS
// ============================================================

bool ensurePeer(const uint8_t *mac) {

  if (

    !radioReady ||

    sameMac(mac, ownMac)

  ) {

    return false;

  }


  if (esp_now_is_peer_exist(mac)) {

    return true;

  }


  esp_now_peer_info_t peer = {};


  memcpy(

    peer.peer_addr,

    mac,

    6

  );


  peer.channel = 0;

  peer.ifidx = WIFI_IF_STA;

  peer.encrypt = false;


  esp_err_t e = esp_now_add_peer(&peer);


  if (

    e != ESP_OK &&

    e != ESP_ERR_ESPNOW_EXIST

  ) {

    Serial.printf(

      "[radio] add peer failed %d\n",

      (int)e

    );

  }


  return

    e == ESP_OK ||

    e == ESP_ERR_ESPNOW_EXIST;

}


// ============================================================
// RECORD DISCOVERED PEER
// ============================================================

Peer* recordPeer(

  const uint8_t *mac,

  uint32_t now

) {

  if (sameMac(mac, ownMac)) {

    return nullptr;

  }


  for (auto &p : peers) {

    if (

      p.used &&

      sameMac(p.mac, mac)

    ) {

      p.lastSeen = now;

      return &p;

    }

  }


  for (auto &p : peers) {

    if (!p.used) {


      p.used = true;


      memcpy(

        p.mac,

        mac,

        6

      );


      p.lastSeen = now;


      Serial.print(

        "[radio] discovered peer "

      );


      macPrint(mac);


      Serial.println();


      ensurePeer(mac);


      return &p;

    }

  }


  return nullptr;

}


// ============================================================
// DUPLICATE DETECTION
// ============================================================

bool duplicate(const LampPacket &p) {

  for (auto &s : seen) {

    if (

      s.used &&

      sameMac(s.mac, p.origin) &&

      s.boot == p.bootId

    ) {


      if (

        (int32_t)(

          p.sequence - s.sequence

        ) <= 0

      ) {

        return true;

      }


      s.sequence = p.sequence;


      return false;

    }

  }


  Seen &s = seen[seenCursor++ % 16];


  s.used = true;


  memcpy(

    s.mac,

    p.origin,

    6

  );


  s.boot = p.bootId;

  s.sequence = p.sequence;


  return false;

}


// ============================================================
// CREATE NETWORK PACKET
// ============================================================

LampPacket makePacket(

  uint8_t kind,

  uint8_t ttl = 0

) {

  LampPacket p = {};


  p.magic = PACKET_MAGIC;

  p.network = NETWORK_ID;


  p.version = 2;

  p.kind = kind;


  memcpy(

    p.origin,

    ownMac,

    6

  );


  p.bootId = bootId;


  p.sequence = ++packetSequence;


  p.eventId = eventId;


  p.elapsedMs =

    (int32_t)(

      millis() - scheduledStart

    );


  p.immersive = immersiveMode;


  p.paletteCount =

    (uint8_t)paletteSize;


  p.brightness = targetBrightness;


  p.speed = animSpeed;


  p.startPhase = phaseAtStart;


  p.staticColor = targetStaticColor;


  for (

    int i = 0;

    i < paletteSize;

    i++

  ) {

    p.colors[i] = palette[i];

  }


  p.ttl = ttl;


  return p;

}


// ============================================================
// SEND ESP-NOW PACKET
// ============================================================

bool sendRaw(

  const uint8_t *dest,

  const LampPacket &p

) {

  if (!radioReady) {

    return false;

  }


  esp_err_t e = esp_now_send(

    dest,

    (const uint8_t*)&p,

    sizeof(p)

  );


  lastRadioTx = millis();


  if (e == ESP_OK) {

    txOK++;

    return true;

  }


  txErr++;


  Serial.printf(

    "[radio] TX error %d kind=%u\n",

    (int)e,

    p.kind

  );


  return false;

}


// ============================================================
// ESP-NOW RECEIVE CALLBACK
//
// ESP32 ARDUINO CORE 3.x
// ============================================================

void onEspNowReceive(

  const esp_now_recv_info_t *info,

  const uint8_t *data,

  int len

) {

  if (

    !radioQueue ||

    !info ||

    len != sizeof(LampPacket)

  ) {

    return;

  }


  RadioMessage msg;


  memcpy(

    &msg.packet,

    data,

    sizeof(LampPacket)

  );


  if (

    msg.packet.magic != PACKET_MAGIC ||

    msg.packet.network != NETWORK_ID ||

    msg.packet.version != 2 ||

    msg.packet.paletteCount > MAX_PALETTE ||

    msg.packet.kind < PKT_HELLO ||

    msg.packet.kind > PKT_ACK

  ) {

    return;

  }


  memcpy(

    msg.linkMac,

    info->src_addr,

    6

  );


  msg.receivedAt = millis();


  callbackRX++;


  if (

    xQueueSend(

      radioQueue,

      &msg,

      0

    ) != pdTRUE

  ) {

    queueDrops++;

  }

}


// ============================================================
// BECOME THE CURRENT COMMAND AUTHORITY
//
// Called when this lamp receives a BLE command.
// ============================================================

void beginAuthority() {

  iAmAuthority = true;

  syncActive = true;


  eventId++;


  memcpy(

    authorityMac,

    ownMac,

    6

  );


  eventCreated = millis();


  scheduledStart =

    eventCreated + START_DELAY_MS;


  phaseAtStart = animT;


  authorityLastHeard = eventCreated;


  // Trigger immediate transmission.

  lastBroadcast = 0;


  // Reset acknowledgments for the new command.

  for (auto &p : peers) {

    p.ackEvent = 0;

    p.ackBoot = 0;

    p.lastUnicast = 0;

  }


  Serial.printf(

    "[sync] NEW command event=%lu, starts in %lu ms\n",

    (unsigned long)eventId,

    (unsigned long)START_DELAY_MS

  );

}


// ============================================================
// SEND ACKNOWLEDGMENT
// ============================================================

void sendAck(const LampPacket &pkt) {

  if (

    !radioReady ||

    iAmAuthority

  ) {

    return;

  }


  if (!ensurePeer(pkt.origin)) {

    return;

  }


  LampPacket ack = makePacket(PKT_ACK);


  ack.eventId = pkt.eventId;


  sendRaw(

    pkt.origin,

    ack

  );

}


// ============================================================
// ACCEPT ANIMATION STATE FROM ANOTHER LAMP
// ============================================================

void acceptState(const RadioMessage &m) {

  const LampPacket &p = m.packet;


  // The lamp receiving BLE commands is the authority.

  if (

    iAmAuthority ||

    sameMac(p.origin, ownMac)

  ) {

    return;

  }


  bool sameSource =

    syncActive &&

    sameMac(

      authorityMac,

      p.origin

    );


  bool sameBoot =

    sameSource &&

    p.bootId == currentAuthorityBoot;


  bool sameEvent =

    sameBoot &&

    p.eventId == eventId;


  // Reject older events from the current authority.

  if (

    syncActive &&

    sameBoot &&

    !sameEvent &&

    (int32_t)(p.eventId - eventId) <= 0

  ) {

    return;

  }


  // Reject an unexpected rebooted authority's state
  // while the current authority remains active.

  if (

    syncActive &&

    sameSource &&

    !sameBoot &&

    p.kind != PKT_COMMAND &&

    m.receivedAt - authorityLastHeard < OWNER_LEASE_MS

  ) {

    return;

  }


  // Another source must issue an explicit command
  // before replacing an active authority.

  if (

    syncActive &&

    !sameSource &&

    p.kind != PKT_COMMAND &&

    m.receivedAt - authorityLastHeard < OWNER_LEASE_MS

  ) {

    return;

  }


  authorityLastHeard = m.receivedAt;


  // Translate the sender's timeline into our local clock.
  //
  // The 2 ms compensation is an approximation, not
  // hardware-level clock synchronization.

  uint32_t estimatedStart =

    m.receivedAt -

    (p.elapsedMs + 2);


  // ==========================================================
  // NEW ANIMATION EVENT
  // ==========================================================

  if (!sameEvent) {


    syncActive = true;


    memcpy(

      authorityMac,

      p.origin,

      6

    );


    currentAuthorityBoot = p.bootId;


    eventId = p.eventId;


    scheduledStart = estimatedStart;


    immersiveMode =

      p.immersive != 0;


    targetBrightness = constrain(

      p.brightness,

      0.05f,

      1.0f

    );


    targetStaticColor = p.staticColor;


    paletteSize = p.paletteCount;


    for (

      int i = 0;

      i < paletteSize;

      i++

    ) {

      palette[i] = p.colors[i];

    }


    animSpeed = constrain(

      p.speed,

      0.1f,

      5.0f

    );


    phaseAtStart = p.startPhase;


    animT = phaseAtStart;


    transitionFrom = renderedColor;


    transitionStart = scheduledStart;


    transitioning = true;


    if (

      p.elapsedMs >=

      (int32_t)TRANSITION_MS

    ) {

      transitioning = false;

      currentBrightness = targetBrightness;

    }


    Serial.print(

      "[sync] FOLLOWING "

    );


    macPrint(authorityMac);


    Serial.printf(

      " event=%lu mode=%s elapsed=%ld ms\n",

      (unsigned long)eventId,

      immersiveMode ? "immersive" : "static",

      (long)p.elapsedMs

    );


    ackPending = true;

  }


  // ==========================================================
  // EXISTING ANIMATION EVENT
  // ==========================================================

  else {


    int32_t error =

      (int32_t)(

        estimatedStart - scheduledStart

      );


    if (abs(error) > 3) {


      scheduledStart +=

        (int32_t)constrain(

          error,

          -2L,

          2L

        );

    }

  }

}


// ============================================================
// PROCESS RECEIVED ESP-NOW PACKETS
// ============================================================

void processRadio() {

  RadioMessage m;


  while (

    xQueueReceive(

      radioQueue,

      &m,

      0

    ) == pdTRUE

  ) {


    const LampPacket &p = m.packet;


    rxOK++;


    // Record the immediate transmitter.

    recordPeer(

      m.linkMac,

      m.receivedAt

    );


    // If the packet was relayed, also record its origin.

    if (

      !sameMac(

        m.linkMac,

        p.origin

      )

    ) {

      recordPeer(

        p.origin,

        m.receivedAt

      );

    }


    // Ignore our own packets.

    if (sameMac(p.origin, ownMac)) {

      continue;

    }


    // Ignore duplicate packets.

    if (duplicate(p)) {

      continue;

    }


    // ========================================================
    // HELLO PACKET
    // ========================================================

    if (p.kind == PKT_HELLO) {


      // A new or rebooted lamp has appeared.
      //
      // If we are the authority, send it the current
      // animation state.

      if (

        iAmAuthority &&

        radioReady

      ) {


        pendingNewPeer = true;


        memcpy(

          newPeerMac,

          p.origin,

          6

        );

      }

    }


    // ========================================================
    // ACKNOWLEDGMENT
    // ========================================================

    else if (p.kind == PKT_ACK) {


      if (

        iAmAuthority &&

        p.eventId == eventId

      ) {


        Peer *peer = recordPeer(

          p.origin,

          m.receivedAt

        );


        if (peer) {


          bool first =

            peer->ackEvent != eventId ||

            peer->ackBoot != bootId;


          peer->ackEvent = eventId;


          peer->ackBoot = bootId;


          peer->lastAck = m.receivedAt;


          ackRX++;


          if (first) {


            Serial.print(

              "[sync] ACK from "

            );


            macPrint(p.origin);


            Serial.printf(

              " for event %lu\n",

              (unsigned long)eventId

            );

          }

        }

      }

    }


    // ========================================================
    // COMMAND OR STATE PACKET
    // ========================================================

    else {


      acceptState(m);


      // Acknowledge the current animation event.

      if (

        !iAmAuthority &&

        syncActive &&

        sameMac(

          authorityMac,

          p.origin

        ) &&

        eventId == p.eventId

      ) {


        if (

          ackPending ||

          m.receivedAt - lastAckSent > 1200

        ) {


          if (

            millis() - lastRadioTx >=

            TRANSFER_GUARD_MS

          ) {


            sendAck(p);


            lastAckSent = millis();


            ackPending = false;

          }

          else {


            ackPending = true;

          }

        }

      }


      // ======================================================
      // MULTI-HOP FORWARDING
      // ======================================================

      if (

        p.ttl > 0 &&

        radioReady &&

        millis() - lastRadioTx >=

        TRANSFER_GUARD_MS

      ) {


        LampPacket fwd = p;


        fwd.ttl--;


        fwd.elapsedMs +=

          (int32_t)(

            millis() - m.receivedAt

          );


        sendRaw(

          broadcastMac,

          fwd

        );

      }

    }

  }

}


// ============================================================
// SERVICE ESP-NOW NETWORK
//
// Discovery, retransmissions, and state synchronization.
// ============================================================

void serviceRadio() {

  if (!radioReady) {

    return;

  }


  uint32_t now = millis();


  if (

    now - lastRadioTx <

    TRANSFER_GUARD_MS

  ) {

    return;

  }


  // ==========================================================
  // PENDING ACKNOWLEDGMENT
  // ==========================================================

  if (

    ackPending &&

    !iAmAuthority &&

    syncActive

  ) {


    if (ensurePeer(authorityMac)) {


      LampPacket a = makePacket(PKT_ACK);


      if (

        sendRaw(

          authorityMac,

          a

        )

      ) {


        ackPending = false;


        lastAckSent = now;

      }


      return;

    }

  }


  // ==========================================================
  // ACTIVE AUTHORITY
  // ==========================================================

  if (

    iAmAuthority &&

    phoneConnected &&

    syncActive

  ) {


    uint32_t age =

      now - eventCreated;


    // Broadcast more frequently immediately after
    // receiving a command.

    uint32_t interval =

      (age < 1500)

      ? 100

      : 300;


    // ========================================================
    // PERIODIC STATE BROADCAST
    // ========================================================

    if (

      lastBroadcast == 0 ||

      now - lastBroadcast >= interval

    ) {


      uint8_t kind =

        (age < 3000)

        ? PKT_COMMAND

        : PKT_STATE;


      LampPacket p = makePacket(

        kind,

        RELAY_HOPS

      );


      if (

        sendRaw(

          broadcastMac,

          p

        )

      ) {


        lastBroadcast = now;

      }


      return;

    }


    // ========================================================
    // NEW PEER
    // ========================================================

    if (pendingNewPeer) {


      if (ensurePeer(newPeerMac)) {


        LampPacket p = makePacket(

          PKT_COMMAND

        );


        sendRaw(

          newPeerMac,

          p

        );

      }


      pendingNewPeer = false;


      return;

    }


    // ========================================================
    // UNICAST RETRIES
    // ========================================================

    for (auto &peer : peers) {


      if (

        !peer.used ||

        now - peer.lastSeen > 12000

      ) {

        continue;

      }


      bool acked =

        peer.ackEvent == eventId &&

        peer.ackBoot == bootId;


      uint32_t retryMs =

        acked

        ? 2500

        : 650;


      if (

        now - peer.lastUnicast <

        retryMs

      ) {

        continue;

      }


      if (ensurePeer(peer.mac)) {


        LampPacket p = makePacket(

          PKT_COMMAND

        );


        sendRaw(

          peer.mac,

          p

        );

      }


      peer.lastUnicast = now;


      return;

    }

  }


  // ==========================================================
  // PERIODIC PEER DISCOVERY
  // ==========================================================

  if (

    lastHello == 0 ||

    now - lastHello >=

      PEER_HELLO_MS +

      ownMac[5] * 3UL

  ) {


    LampPacket p = makePacket(

      PKT_HELLO

    );


    if (

      sendRaw(

        broadcastMac,

        p

      )

    ) {


      lastHello = now;

    }

  }

}


// ============================================================
// DIAGNOSTICS
// ============================================================

void serviceStats() {

  uint32_t now = millis();


  if (

    now - lastStats < 4000

  ) {

    return;

  }


  lastStats = now;


  uint8_t channel = 0;


  wifi_second_chan_t second =

    WIFI_SECOND_CHAN_NONE;


  esp_err_t ce =

    esp_wifi_get_channel(

      &channel,

      &second

    );


  int known = 0;

  int confirmed = 0;


  for (auto &p : peers) {


    if (

      p.used &&

      now - p.lastSeen < 12000

    ) {


      known++;


      if (

        iAmAuthority &&

        p.ackEvent == eventId &&

        p.ackBoot == bootId

      ) {


        confirmed++;

      }

    }

  }


  Serial.printf(

    "[diag] role=%s ch=%u (err=%d) peers=%d ACK=%d txOK=%lu txErr=%lu rx=%lu cbRX=%lu qDrop=%lu\n",

    iAmAuthority

      ? "BLE-SOURCE"

      : (syncActive ? "FOLLOWER" : "IDLE"),

    channel,

    (int)ce,

    known,

    confirmed,

    (unsigned long)txOK,

    (unsigned long)txErr,

    (unsigned long)rxOK,

    (unsigned long)callbackRX,

    (unsigned long)queueDrops

  );


  if (

    ce == ESP_OK &&

    channel != ESPNOW_CHANNEL

  ) {


    Serial.printf(

      "[ERROR] Channel %u differs from required %u. ALL lamps must share a channel!\n",

      channel,

      ESPNOW_CHANNEL

    );

  }


  if (

    iAmAuthority &&

    now - eventCreated > 6000 &&

    known == 0

  ) {


    Serial.println(

      "[WARN] No peers discovered. Check both devices show [radio] READY, same channel/network ID, and follower [diag] rx>0."

    );

  }


  if (

    !iAmAuthority &&

    now > 7000 &&

    callbackRX == 0

  ) {


    Serial.println(

      "[WARN] No ESP-NOW frames received; changing animations cannot help until RF reception works."

    );

  }

}


// ============================================================
// INITIALIZE ESP-NOW
// ============================================================

void setupESPNow() {


  // ESP-NOW uses the Wi-Fi STA interface.
  //
  // We do not connect to a Wi-Fi access point.

  if (!WiFi.mode(WIFI_STA)) {


    Serial.println(

      "[radio] WiFi STA failed"

    );


    return;

  }


  WiFi.setSleep(false);


  WiFi.disconnect();


  delay(100);


  // ==========================================================
  // SET WI-FI CHANNEL
  // ==========================================================

  esp_err_t e =

    esp_wifi_set_channel(

      ESPNOW_CHANNEL,

      WIFI_SECOND_CHAN_NONE

    );


  if (e != ESP_OK) {


    Serial.printf(

      "[radio] SET CHANNEL FAILED err=%d\n",

      (int)e

    );

  }


  // ==========================================================
  // CHECK ACTUAL CHANNEL
  // ==========================================================

  uint8_t actual = 0;


  wifi_second_chan_t second =

    WIFI_SECOND_CHAN_NONE;


  esp_wifi_get_channel(

    &actual,

    &second

  );


  // ==========================================================
  // READ MAC ADDRESS
  // ==========================================================

  e = esp_wifi_get_mac(

    WIFI_IF_STA,

    ownMac

  );


  if (e != ESP_OK) {


    Serial.printf(

      "[radio] READ MAC FAILED err=%d\n",

      (int)e

    );

  }


  Serial.print(

    "[radio] STA MAC "

  );


  macPrint(ownMac);


  Serial.printf(

    " actual channel=%u required=%u\n",

    actual,

    ESPNOW_CHANNEL

  );


  // ==========================================================
  // REJECT INCORRECT CHANNEL
  // ==========================================================

  if (actual != ESPNOW_CHANNEL) {


    Serial.println(

      "[radio] REFUSING: channel mismatch; check Wi-Fi state"

    );


    return;

  }


  // ==========================================================
  // INITIALIZE ESP-NOW
  // ==========================================================

  e = esp_now_init();


  if (e != ESP_OK) {


    Serial.printf(

      "[radio] init failed %d\n",

      (int)e

    );


    return;

  }


  // ==========================================================
  // REGISTER RECEIVE CALLBACK
  // ==========================================================

  esp_now_register_recv_cb(

    onEspNowReceive

  );


  // ==========================================================
  // ADD BROADCAST PEER
  // ==========================================================

  esp_now_peer_info_t peer = {};


  memcpy(

    peer.peer_addr,

    broadcastMac,

    6

  );


  peer.channel = 0;


  peer.ifidx = WIFI_IF_STA;


  peer.encrypt = false;


  e = esp_now_add_peer(&peer);


  if (

    e != ESP_OK &&

    e != ESP_ERR_ESPNOW_EXIST

  ) {


    Serial.printf(

      "[radio] broadcast peer failed %d\n",

      (int)e

    );


    return;

  }


  radioReady = true;


  Serial.printf(

    "[radio] READY on channel %u, packet %u bytes\n",

    actual,

    (unsigned)sizeof(LampPacket)

  );

}


// ============================================================
// ORIGINAL BLE SERVER CALLBACKS
// ============================================================

class ServerCallbacks : public BLEServerCallbacks {

  void onConnect(

    BLEServer*

  ) override {


    phoneConnected = true;


    Serial.println(

      "[ble] connected"

    );

  }


  void onDisconnect(

    BLEServer* s

  ) override {


    phoneConnected = false;


    // Stop acting as the authority when the phone disconnects.

    iAmAuthority = false;


    Serial.println(

      "[ble] disconnected — restarting advertising"

    );


    s->getAdvertising()->start();

  }

};


// ============================================================
// BLE COMMAND CALLBACK
// ============================================================

class CmdCallbacks : public BLECharacteristicCallbacks {

  void onWrite(

    BLECharacteristic* pChar

  ) override {


    String v = pChar->getValue();


    if (

      v.length() == 0 ||

      !bleQueue

    ) {


      return;

    }


    BleMessage message = {};


    size_t len = std::min(

      (size_t)v.length(),

      sizeof(message.json) - 1

    );


    memcpy(

      message.json,

      v.c_str(),

      len

    );


    message.json[len] = '\0';


    if (

      xQueueSend(

        bleQueue,

        &message,

        0

      ) != pdTRUE

    ) {


      Serial.println(

        "[ble] WARNING: command queue full"

      );

    }

  }

};


// ============================================================
// PROCESS BLE COMMANDS
// ============================================================

void processBleCommands() {

  BleMessage m;


  while (

    xQueueReceive(

      bleQueue,

      &m,

      0

    ) == pdTRUE

  ) {


    JsonDocument validation;


    auto err = deserializeJson(

      validation,

      m.json

    );


    if (err) {


      Serial.printf(

        "[ble] invalid JSON (%s)\n",

        err.c_str()

      );


      continue;

    }


    // Process using your original JSON parser.

    processCommand(m.json);


    // Become the temporary authority.

    beginAuthority();

  }

}


// ============================================================
// SYNCHRONIZED LAMP RENDERER
// ============================================================

void renderLamp() {

  uint32_t now = millis();


  // ==========================================================
  // WAIT FOR SCHEDULED ANIMATION START
  // ==========================================================

  if (

    syncActive &&

    (int32_t)(

      now - scheduledStart

    ) < 0

  ) {


    lastLoopMs = now;


    return;

  }


  // ==========================================================
  // FRAME TIMING
  // ==========================================================

  uint32_t dt =

    now - lastLoopMs;


  if (dt < 8) {

    return;

  }


  lastLoopMs = now;


  // ==========================================================
  // SMOOTH BRIGHTNESS
  // ==========================================================

  float bDiff =

    targetBrightness -

    currentBrightness;


  if (fabsf(bDiff) > 0.002f) {


    currentBrightness +=

      bDiff *

      ((float)dt /

      (float)(TRANSITION_MS / 3));

  }


  else {


    currentBrightness = targetBrightness;

  }


  currentBrightness = constrain(

    currentBrightness,

    0.05f,

    1.0f

  );


  // ==========================================================
  // ANIMATION PHASE
  // ==========================================================

  if (

    immersiveMode &&

    paletteSize >= 2

  ) {


    if (syncActive) {


      uint32_t elapsed =

        now - scheduledStart;


      animT =

        phaseAtStart +

        0.006f *

        animSpeed *

        ((float)elapsed / 33.0f);

    }


    else {


      animT +=

        0.006f *

        animSpeed *

        ((float)dt / 33.0f);

    }

  }


  // ==========================================================
  // TARGET COLOR
  // ==========================================================

  RGB targetColor =

    (immersiveMode && paletteSize >= 2)

      ? splineColor(animT)

      : targetStaticColor;


  // ==========================================================
  // COLOR TRANSITION
  // ==========================================================

  RGB finalColor;


  if (transitioning) {


    float t = constrain(

      (float)(

        now - transitionStart

      ) / TRANSITION_MS,

      0.0f,

      1.0f

    );


    finalColor = lerpRGB(

      transitionFrom,

      targetColor,

      easeInOut(t)

    );


    if (t >= 1.0f) {


      transitioning = false;

    }

  }


  else {


    finalColor = targetColor;

  }


  // ==========================================================
  // OUTPUT TO NEOPIXELS
  // ==========================================================

  writeAllLEDs(

    finalColor,

    currentBrightness

  );

}


// ============================================================
// SETUP
// ============================================================

void setup() {


  Serial.begin(115200);


  delay(200);


  // ==========================================================
  // NEOPIXEL INITIALIZATION
  // ==========================================================

  strip.begin();


  // Original lavender startup color.
  //
  // LEDs turn on before BLE or ESP-NOW initialization.

  writeAllLEDs(

    renderedColor,

    currentBrightness

  );


  Serial.println(

    "[lamp] original lavender startup enabled"

  );


  // ==========================================================
  // CREATE QUEUES
  // ==========================================================

  bleQueue = xQueueCreate(

    6,

    sizeof(BleMessage)

  );


  radioQueue = xQueueCreate(

    40,

    sizeof(RadioMessage)

  );


  if (

    !bleQueue ||

    !radioQueue

  ) {


    Serial.println(

      "[fatal] could not create queues"

    );


    while (true) {


      delay(1000);

    }

  }


  // ==========================================================
  // GENERATE UNIQUE IDENTIFIERS
  // ==========================================================

  bootId = esp_random();


  packetSequence = esp_random();


  eventId = esp_random();


  // ==========================================================
  // INITIALIZE ESP-NOW
  // ==========================================================

#if ENABLE_ESPNOW

  setupESPNow();

#else

  Serial.println(

    "[radio] ESP-NOW DISABLED"

  );

#endif


  // ==========================================================
  // ORIGINAL BLUETOOTH INITIALIZATION
  // ==========================================================

  BLEDevice::init(

    "WellnessLamp"

  );


  BLEDevice::setMTU(512);


  BLEServer* pServer =

    BLEDevice::createServer();


  pServer->setCallbacks(

    new ServerCallbacks()

  );


  BLEService* pService =

    pServer->createService(

      SERVICE_UUID

    );


  BLECharacteristic* pCmd =

    pService->createCharacteristic(

      CMD_UUID,

      BLECharacteristic::PROPERTY_WRITE |

      BLECharacteristic::PROPERTY_WRITE_NR

    );


  pCmd->setCallbacks(

    new CmdCallbacks()

  );


  pService->start();


  // Same advertising behavior as your original firmware.

  pServer->getAdvertising()->start();


  // ==========================================================
  // START RENDERER
  // ==========================================================

  lastLoopMs = millis();


  Serial.println(

    "WellnessLamp ready (original BLE + reliable ESP-NOW)"

  );

}


// ============================================================
// MAIN LOOP
// ============================================================

void loop() {


  // Process phone commands.

  processBleCommands();


  // Process incoming ESP-NOW packets.

  processRadio();


  // Broadcast state, discover peers, and retransmit.

  serviceRadio();


  // Print network diagnostics.

  serviceStats();


  // Render synchronized LED animation.

  renderLamp();


  delay(1);

}