// Add this to your enrollmentController.ts as a temporary debug endpoint

// ── TEMP DEBUG: Simple test endpoint ──
export async function debugMyCourses(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'No user ID found' });
    }

    // Test 1: Basic user check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Test 2: Count enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: { user_id: userId }
    });

    // Test 3: Get basic enrollment data
    const enrollments = await prisma.enrollment.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        course_id: true,
        enrolled_at: true
      },
      take: 5 // Limit to 5 to avoid large queries
    });

    return res.json({
      debug: true,
      user: user,
      enrollmentCount,
      enrollments,
      message: 'Debug endpoint working'
    });

  } catch (err) {
    console.error('Debug error:', err);
    return res.status(500).json({ 
      error: 'Debug failed', 
      details: err.message 
    });
  }
}

// Add this route to enrollmentRoutes.ts:
// router.get("/debug/my-courses", authenticate, debugMyCourses);