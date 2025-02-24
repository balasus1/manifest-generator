module.exports = {
    apps: [
      {
        name: "manifest-generator", // App name
        script: "npm",             // Command to run
        args: "start",              // Arguments passed to pnpm
        cwd: "./",                  // Working directory (root of the project)
        exec_mode: "fork",          // Use fork mode
        instances: 1,               // Number of instances (1 for Next.js)
        autorestart: true,          // Restart on crash
        watch: false,               // Disable watching for production
        env: {
          NODE_ENV: "production",   // Set environment to production
        },
      },
    ],
  };