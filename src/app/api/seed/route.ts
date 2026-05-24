import { NextResponse } from 'next/server'
import { execSync } from 'child_process'

// POST /api/seed — Trigger database seeding
export async function POST() {
  try {
    console.log('🌱 Seeding database via API...')
    execSync('bun run prisma/seed.ts', {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 60000,
    })
    return NextResponse.json({ message: 'Database seeded successfully' })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
