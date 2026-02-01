# ⚡ Quick Start Guide - Antigravity Dev Container

## 🚀 3-Minute Setup

### Step 1: Prerequisites ✅
```bash
# Verify Docker is running
docker --version
# Expected: Docker version 20.x.x or higher

# Verify VS Code has Dev Containers extension
code --list-extensions | grep ms-vscode-remote.remote-containers
```

### Step 2: Open in Container 📦
1. Open this folder in VS Code
2. `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: **"Dev Containers: Reopen in Container"**
4. Wait 3-5 minutes for first build

### Step 3: Verify Setup ✓
```bash
# Run verification script in terminal
./.devcontainer/verify-setup.sh

# Expected output: "ALL CHECKS PASSED!"
```

### Step 4: Test Antigravity 🤖
1. `Cmd+Shift+P`
2. Type: **"Antigravity: Show Status"**
3. Verify: ✅ Server Status: Running

### Step 5: Start Development 💻
```bash
# Install dependencies (if not auto-installed)
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## 🔥 Common Issues (90% of problems)

### Issue: Extension fails with "Process exited with code 1"
```bash
chmod -R 755 ~/.antigravity
# Cmd+Shift+P -> "Developer: Reload Window"
```

### Issue: Permission denied errors
```bash
sudo chown -R vscode:vscode ~/
chmod -R 755 ~/.antigravity ~/.vscode-server
```

### Issue: Container won't start
```bash
# Rebuild without cache
# Cmd+Shift+P -> "Dev Containers: Rebuild Container Without Cache"
```

---

## 📚 Full Documentation

- **Complete Setup Guide**: `.devcontainer/README.md`
- **Troubleshooting**: `.devcontainer/TROUBLESHOOTING.md`
- **Verification Script**: `.devcontainer/verify-setup.sh`

---

## ✅ Success Checklist

After setup, you should have:

- [x] Container running
- [x] User is `vscode`
- [x] Node.js v18+
- [x] `~/.antigravity` directory exists with correct permissions
- [x] Antigravity extension shows "Server Status: Running"
- [x] `npm run dev` works
- [x] http://localhost:3000 accessible

---

## 🆘 Need Help?

1. **Run diagnostics**: `./.devcontainer/verify-setup.sh`
2. **Check logs**: `cat ~/.antigravity/server.log`
3. **Read troubleshooting**: `.devcontainer/TROUBLESHOOTING.md`
4. **Nuclear option**: Remove container and rebuild

---

**Setup Time**: 3-5 minutes (first time), <1 minute (subsequent starts)
