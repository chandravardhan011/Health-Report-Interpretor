import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { 
  collection, addDoc, getDocs, query, orderBy, limit, 
  where, serverTimestamp, Timestamp 
} from 'firebase/firestore'

// GET — Fetch reviews (simplified query - no index needed)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limitCount = parseInt(searchParams.get('limit') || '50')
    
    // Simple query - just order by creation date (no index needed)
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    const reviews = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        role: data.role,
        specialty: data.specialty || null,
        rating: data.rating,
        title: data.title,
        text: data.text,
        verified: data.verified || false,
        helpful: data.helpful || 0,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
      }
    })

    return NextResponse.json({ reviews, total: reviews.length })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST — Submit a new review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, role, specialty, rating, title, text, userId, userEmail } = body

    // Validation
    if (!name || !role || !rating || !text) {
      return NextResponse.json(
        { error: 'Name, role, rating, and review text are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (text.length < 20) {
      return NextResponse.json(
        { error: 'Review must be at least 20 characters long' },
        { status: 400 }
      )
    }

    if (text.length > 500) {
      return NextResponse.json(
        { error: 'Review must be under 500 characters' },
        { status: 400 }
      )
    }

    const validRoles = ['Doctor', 'Patient', 'Healthcare Professional', 'Caregiver', 'Medical Student']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role selected' },
        { status: 400 }
      )
    }

    const review = {
      name: name.trim(),
      role,
      specialty: specialty?.trim() || null,
      rating: Number(rating),
      title: title?.trim() || null,
      text: text.trim(),
      userId: userId || null,
      userEmail: userEmail || null,
      verified: !!userId, // Auto-verified if logged in with Clerk
      approved: true, // Auto-approve for now; can add moderation later
      helpful: 0,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'reviews'), review)

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: 'Review submitted successfully!' 
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
