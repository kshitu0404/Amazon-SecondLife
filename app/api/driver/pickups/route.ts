import { NextRequest, NextResponse } from 'next/server';

let pickups = [
  {
    id: "PKP-2041",
    status: "assigned",
    assigned_driver_id: "DRV-849",
    address: "Flat 402, Andheri East, Mumbai",
    item: "Nike Air Force 1 '07 - White",
    otp: "8462",
    otp_verified: false,
    route_deviation_km: 1.2
  },
  {
    id: "PKP-2042",
    status: "assigned",
    assigned_driver_id: "DRV-849",
    address: "B-21, Powai Heights, Mumbai",
    item: "Sony WH-1000XM4",
    otp: "1194",
    otp_verified: false,
    route_deviation_km: 0.5
  }
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const driverId = searchParams.get('driverId');
  
  if (driverId) {
    return NextResponse.json({ success: true, pickups: pickups.filter(p => p.assigned_driver_id === driverId) });
  }
  return NextResponse.json({ success: true, pickups });
}

export async function POST(req: NextRequest) {
  try {
    const { pickupId, otp } = await req.json();
    
    const pickupIndex = pickups.findIndex(p => p.id === pickupId);
    if (pickupIndex === -1) {
      return NextResponse.json({ success: false, error: 'Pickup not found' }, { status: 404 });
    }

    if (pickups[pickupIndex].otp === otp) {
      pickups[pickupIndex].otp_verified = true;
      pickups[pickupIndex].status = "completed";
      return NextResponse.json({ success: true, message: 'OTP Verified successfully. Pickup confirmed.' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
