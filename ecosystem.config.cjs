module.exports = {
  apps: [
    {
      name: 'kasp-portal',
      script: 'dist/server.cjs',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MAIN_DOMAIN: 'kasp.ir'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        MAIN_DOMAIN: 'kasp.ir'
      }
    }
  ]
};
