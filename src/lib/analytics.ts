export function reportWebVitals(metric: any) {
  // ✅ Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Replace with your analytics service
    console.log(metric);
  }
}
