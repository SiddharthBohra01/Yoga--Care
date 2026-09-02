import api from './axios';

export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => api.get('/api/auth/me'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

export const userAPI = {
  updateProfile: (data) => api.put('/api/users/profile', data),
  completeOnboarding: () => api.post('/api/users/onboarding/complete', { start_trial: true }),
  getFitnessTwin: () => api.get('/api/users/fitness-twin'),
};

export const planAPI = {
  getMyPlan: () => api.get('/api/plans/my-plan'),
  getDay: (dayNumber) => api.get(`/api/plans/days/${dayNumber}`),
  getExercise: (id) => api.get(`/api/plans/exercises/${id}`),
  getExerciseNavigation: (id) => api.get(`/api/plans/exercises/${id}/navigation`),
  completeExercise: (exerciseId, durationSeconds) =>
    api.post('/api/plans/exercises/complete', {
      exercise_id: exerciseId,
      duration_seconds: durationSeconds,
    }),
  generatePlan: () => api.post('/api/plans/generate'),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
  getAchievements: () => api.get('/api/dashboard/achievements'),
  getWeightHistory: () => api.get('/api/dashboard/weight-history'),
  logWeight: (weightKg) => api.post('/api/dashboard/weight', { weight_kg: weightKg }),
  getCaloriesChart: () => api.get('/api/dashboard/calories-chart'),
  logWater: (glasses = 1) => api.post('/api/dashboard/water', { glasses, ml_amount: 250 }),
  updateReminder: (data) => api.put('/api/dashboard/reminder', data),
  getShare: () => api.get('/api/dashboard/share'),
  getLeaderboard: () => api.get('/api/dashboard/leaderboard'),
};

export const communityAPI = {
  getPosts: () => api.get('/api/community/posts'),
  createPost: (data) => api.post('/api/community/posts', data),
  toggleLike: (postId) => api.post(`/api/community/posts/${postId}/like`),
  addComment: (postId, content) => api.post(`/api/community/posts/${postId}/comment`, { content }),
};

export const sleepAPI = {
  getHistory: () => api.get('/api/sleep/history'),
  logSleep: (data) => api.post('/api/sleep', data),
  getRecommendations: () => api.get('/api/sleep/recommendations'),
};

export const dietAPI = {
  getPlan: () => api.get('/api/diet/plan'),
  getHistory: () => api.get('/api/diet/history'),
  logMeal: (data) => api.post('/api/diet', data),
  deleteMeal: (mealId) => api.delete(`/api/diet/${mealId}`),
};

export const liveClassAPI = {
  getClasses: () => api.get('/api/classes'),
  bookClass: (classId) => api.post(`/api/classes/${classId}/book`),
};

export const contentAPI = {
  getReviews: () => api.get('/api/reviews'),
  submitFeedback: (data) => api.post('/api/feedback', data),
  getMeditationTracks: () => api.get('/api/meditation-tracks'),
};

export const adminAPI = {
  getUsers: () => api.get('/api/admin/users'),
  toggleUser: (id) => api.put(`/api/admin/users/${id}/toggle-active`),
  getFeedback: () => api.get('/api/admin/feedback'),
  markFeedbackRead: (id) => api.put(`/api/admin/feedback/${id}/read`),
  getReviews: () => api.get('/api/admin/reviews'),
  approveReview: (id) => api.put(`/api/admin/reviews/${id}/approve`),
  addExercise: (data) => api.post('/api/admin/exercises', data),
};
