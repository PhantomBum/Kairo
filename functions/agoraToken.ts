import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Agora token generation
// Based on Agora's RTC token builder

const Role = {
  PUBLISHER: 1,
  SUBSCRIBER: 2
};

function generateToken(appId, appCertificate, channelName, uid, role, privilegeExpireTs) {
  const encoder = new TextEncoder();
  
  // Build message
  const ts = Math.floor(Date.now() / 1000);
  const salt = Math.floor(Math.random() * 0xFFFFFFFF);
  
  // Create privileges
  const privileges = {
    1: privilegeExpireTs, // kJoinChannel
    2: privilegeExpireTs, // kPublishAudioStream
    3: privilegeExpireTs, // kPublishVideoStream
    4: privilegeExpireTs  // kPublishDataStream
  };
  
  // Pack message
  const message = packMessage(ts, salt, uid, privileges);
  const signature = generateSignature(appCertificate, appId, channelName, uid, message);
  
  // Build token
  const content = packContent(signature, message);
  const version = "006";
  
  return version + appId + base64Encode(content);
}

function packMessage(ts, salt, uid, privileges) {
  const buffer = [];
  packUint32(buffer, salt);
  packUint32(buffer, ts);
  packUint32(buffer, uid);
  packUint32(buffer, Object.keys(privileges).length);
  
  for (const [key, value] of Object.entries(privileges)) {
    packUint16(buffer, parseInt(key));
    packUint32(buffer, value);
  }
  
  return new Uint8Array(buffer);
}

function packContent(signature, message) {
  const buffer = [];
  packString(buffer, signature);
  packString(buffer, message);
  return new Uint8Array(buffer);
}

async function generateSignature(appCertificate, appId, channelName, uid, message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(appId + channelName + uid.toString());
  const messageData = new Uint8Array([...data, ...message]);
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appCertificate),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return new Uint8Array(signature);
}

function packUint16(buffer, value) {
  buffer.push(value & 0xFF);
  buffer.push((value >> 8) & 0xFF);
}

function packUint32(buffer, value) {
  buffer.push(value & 0xFF);
  buffer.push((value >> 8) & 0xFF);
  buffer.push((value >> 16) & 0xFF);
  buffer.push((value >> 24) & 0xFF);
}

function packString(buffer, str) {
  const bytes = str instanceof Uint8Array ? str : new TextEncoder().encode(str);
  packUint16(buffer, bytes.length);
  for (const byte of bytes) {
    buffer.push(byte);
  }
}

function base64Encode(data) {
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channelName, uid } = await req.json();
    
    if (!channelName) {
      return Response.json({ error: 'Channel name is required' }, { status: 400 });
    }

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');
    
    if (!appId || !appCertificate) {
      console.error('Missing Agora credentials');
      return Response.json({ error: 'Agora not configured' }, { status: 500 });
    }

    // Use numeric UID (Agora requires numeric or 0 for string)
    const numericUid = uid || 0;
    
    // Token expires in 24 hours
    const privilegeExpireTs = Math.floor(Date.now() / 1000) + 86400;
    
    const token = await generateToken(
      appId,
      appCertificate,
      channelName,
      numericUid,
      Role.PUBLISHER,
      privilegeExpireTs
    );

    return Response.json({ 
      token,
      appId,
      channel: channelName,
      uid: numericUid
    });
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});