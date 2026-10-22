module.exports = {
  apps: [
    {
      name: "nucleux-mcp",
      cwd: "/home/jaswant-singh/nucleux-mcp",
      script: "src/index.js",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        NUCLEUX_MCP_HOST: "127.0.0.1",
        NUCLEUX_MCP_PORT: "8118",
      },
      out_file: "/home/jaswant-singh/nucleux-mcp/logs/nucleux-mcp.out.log",
      error_file: "/home/jaswant-singh/nucleux-mcp/logs/nucleux-mcp.err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
