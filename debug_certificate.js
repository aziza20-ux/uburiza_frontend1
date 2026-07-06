// Debug script to test certificate generation
// Run this in your browser console while on the course material page

console.log('🔍 Certificate Debug Helper');
console.log('This script will help debug certificate generation issues');

// Check if we have access to the API
const checkAPI = async () => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
      console.log('❌ No auth token found');
      return;
    }
    
    console.log('✅ Auth token found');
    
    // Get user info from context or localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    console.log('👤 User info:', userInfo);
    
    // Test API connection
    const response = await fetch('/api/my-courses', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection working');
      console.log('📚 Enrolled courses:', data.courses?.length || 0);
      
      // Show course progress
      data.courses?.forEach((enrollment, idx) => {
        const progress = enrollment.progress;
        console.log(`📖 Course ${idx + 1}: ${enrollment.course?.title}`);
        console.log(`   Progress: ${progress?.completedLessons || 0}/${progress?.totalLessons || 0} lessons (${progress?.percentage || 0}%)`);
        console.log(`   Completed: ${enrollment.completed_at ? '✅ Yes' : '❌ No'}`);
      });
    } else {
      console.log('❌ API connection failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Error testing API:', error);
  }
};

// Check certificate API
const checkCertificates = async () => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    if (!token || !userInfo.id) {
      console.log('❌ Missing auth token or user ID');
      return;
    }
    
    const response = await fetch(`/api/certificates/user/${userInfo.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('🏆 Certificates found:', data.certificates?.length || 0);
      data.certificates?.forEach((cert, idx) => {
        console.log(`   Certificate ${idx + 1}: ${cert.course.title} (${cert.certificate_uid})`);
      });
    } else {
      console.log('❌ Certificate API failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Error checking certificates:', error);
  }
};

// Test lesson completion
const testLessonComplete = async (lessonId) => {
  try {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      console.log('❌ No auth token found');
      return;
    }
    
    if (!lessonId) {
      console.log('❌ Please provide a lesson ID');
      return;
    }
    
    console.log(`🎯 Testing lesson completion for: ${lessonId}`);
    
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lessonId })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Lesson marked complete successfully');
      console.log('📊 Response data:', data);
      
      if (data.courseCompleted) {
        console.log('🎉 COURSE COMPLETED!');
        if (data.certificate) {
          console.log('🏆 CERTIFICATE GENERATED!', data.certificate);
        } else {
          console.log('❌ No certificate in response');
        }
      } else {
        console.log('📚 Course not yet completed');
      }
    } else {
      const errorData = await response.text();
      console.log('❌ Lesson completion failed:', response.status, errorData);
    }
  } catch (error) {
    console.log('❌ Error testing lesson completion:', error);
  }
};

// Run initial checks
checkAPI();
checkCertificates();

// Export test function for manual use
window.testLessonComplete = testLessonComplete;

console.log('💡 To test lesson completion, use: testLessonComplete("your-lesson-id")');
console.log('💡 You can find lesson IDs in the network tab or by inspecting course data');