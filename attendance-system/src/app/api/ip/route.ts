import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const nets = os.networkInterfaces();
  let ips: string[] = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }

  // Prioritize typical local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localIp = ips.find(ip => 
    ip.startsWith('192.168.') || 
    ip.startsWith('10.') || 
    (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)
  ) || ips[0] || 'localhost';

  return NextResponse.json({ ip: localIp });
}
