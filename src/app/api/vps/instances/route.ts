import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const vpsInstances = await db.vpsInstance.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      instances: vpsInstances.map(vps => ({
        ...vps,
        ipAddresses: vps.ipAddresses ? JSON.parse(vps.ipAddresses) : []
      }))
    })
  } catch (error) {
    console.error("Failed to fetch VPS instances:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, hostname, plan, os } = body

    // Define plan configurations
    const planConfigs = {
      STARTER: { cpu: 1, ram: 2, storage: 40, bandwidth: 2, price: 499 },
      PROFESSIONAL: { cpu: 2, ram: 4, storage: 80, bandwidth: 4, price: 999 },
      BUSINESS: { cpu: 4, ram: 8, storage: 160, bandwidth: 8, price: 1999 }
    }

    const config = planConfigs[plan as keyof typeof planConfigs]
    if (!config) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      )
    }

    // Create VPS instance
    const vpsInstance = await db.vpsInstance.create({
      data: {
        name,
        hostname,
        plan: plan as any,
        cpu: config.cpu,
        ram: config.ram,
        storage: config.storage,
        bandwidth: config.bandwidth,
        price: config.price,
        os,
        status: "PENDING",
        ipAddresses: JSON.stringify([]),
        userId: session.user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    })

    // In a real implementation, you would integrate with Flint/Virtualization here
    // For now, we'll simulate the VPS creation
    setTimeout(async () => {
      try {
        await db.vpsInstance.update({
          where: { id: vpsInstance.id },
          data: {
            status: "ACTIVE",
            ipAddresses: JSON.stringify([`192.168.1.${Math.floor(Math.random() * 254) + 1}`])
          }
        })
      } catch (error) {
        console.error("Failed to update VPS status:", error)
      }
    }, 5000) // Simulate 5 second provisioning time

    return NextResponse.json({
      instance: {
        ...vpsInstance,
        ipAddresses: []
      },
      message: "VPS instance creation started. It will be active shortly."
    }, { status: 201 })

  } catch (error) {
    console.error("Failed to create VPS instance:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}