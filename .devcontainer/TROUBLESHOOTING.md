# 🔧 Antigravity Dev Container Troubleshooting Guide

## 🚨 Emergency Fixes

### Quick Fix #1: Permissions Reset
```bash
# Trong container terminal:
chmod -R 755 ~/.antigravity ~/.vscode-server ~/.config
sudo chown -R vscode:vscode ~/
# Reload VS Code: Cmd+Shift+P -> "Developer: Reload Window"
```

### Quick Fix #2: Fresh Container Start
```bash
# Cmd+Shift+P -> "Dev Containers: Rebuild Container Without Cache"
```

### Quick Fix #3: Nuclear Option
```bash
# Trên host machine:
docker stop $(docker ps -q --filter ancestor=mcr.microsoft.com/devcontainers/universal:2)
docker system prune -a --volumes -f
# Trong VS Code: Cmd+Shift+P -> "Dev Containers: Rebuild Container"
```

---

## 📋 Diagnostic Commands

### Check Current Status
```bash
# User check
whoami  # Should be: vscode

# Node version
node --version  # Should be: v18.x.x or higher

# Directory structure
ls -la ~/ | grep -E "antigravity|vscode|config"

# Permissions detail
ls -ld ~/.antigravity
stat ~/.antigravity

# Check Antigravity processes
ps aux | grep antigravity | grep -v grep

# Environment variables
env | grep -i antigravity
env | grep -i node

# Logs
cat ~/.antigravity/server.log
tail -f ~/.antigravity/server.log  # Real-time
```

### Check Docker Status (from host)
```bash
# List containers
docker ps -a | grep devcontainer

# Container stats
docker stats <container-name>

# Container logs
docker logs <container-name> --tail 50

# Inspect container
docker inspect <container-name> | grep -A 10 "Mounts"
```

---

## 🔍 Specific Error Solutions

### Error: "Process exited with code 1"

**Symptoms:**
- Antigravity extension fails to start
- Extension icon shows error
- Output panel shows exit code 1

**Root Causes & Solutions:**

#### Cause 1: Missing ~/.antigravity directory
```bash
# Verify
ls -la ~/.antigravity

# Fix
mkdir -p ~/.antigravity
chmod 755 ~/.antigravity
echo "Initialized at $(date)" > ~/.antigravity/server.log
```

#### Cause 2: Permission denied on ~/.antigravity
```bash
# Verify
touch ~/.antigravity/test.txt
# If error, then:

# Fix
sudo chown -R vscode:vscode ~/.antigravity
chmod -R 755 ~/.antigravity
```

#### Cause 3: Node.js version too old
```bash
# Verify
node --version

# If < v18, rebuild container:
# Cmd+Shift+P -> "Rebuild Container Without Cache"
```

#### Cause 4: Extension server crash
```bash
# Check logs
cat ~/.antigravity/server.log
grep -i error ~/.antigravity/server.log

# Check Extension Host logs:
# Cmd+Shift+P -> "Developer: Show Logs" -> "Extension Host"

# Restart extension:
# Cmd+Shift+P -> "Developer: Reload Window"
```

---

### Error: "EACCES: permission denied, open '/home/vscode/.antigravity/...'"

**Solution:**
```bash
# Full permission reset
sudo chown -R vscode:vscode ~/
chmod -R 755 ~/.antigravity ~/.vscode-server ~/.config ~/.npm

# Verify
ls -la ~/.antigravity
id  # Should show uid and gid for vscode

# Reload
# Cmd+Shift+P -> "Developer: Reload Window"
```

---

### Error: "Cannot find module 'X'" or "Module not found"

**Solutions:**

#### If it's a Node.js built-in module:
```bash
# Check Node version
node --version  # Must be ≥18

# If wrong, rebuild container
```

#### If it's a npm package:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If specific package missing:
npm install <package-name>
```

#### If it's a native module (bcrypt, pg-native, etc.):
```bash
# Rebuild native modules
npm rebuild

# Or specific package:
npm rebuild bcrypt
```

---

### Error: "Port 3000 is already in use"

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

---

### Error: Extension not appearing in Extensions panel

**Solutions:**

1. **Check installation:**
```bash
# In container terminal:
code --list-extensions | grep antigravity
```

2. **Manual install:**
```bash
# Cmd+Shift+P -> "Extensions: Install Extensions"
# Search: "google.antigravity-agent"
```

3. **Check devcontainer.json:**
```json
"customizations": {
    "vscode": {
        "extensions": [
            "google.antigravity-agent"
        ]
    }
}
```

4. **Rebuild container:**
```bash
# Cmd+Shift+P -> "Rebuild Container"
```

---

### Error: "Docker daemon not running"

**Solutions:**

1. **Start Docker Desktop**
2. **Wait for Docker to fully start**
3. **Verify:**
```bash
docker ps
docker info
```

---

### Error: Container build timeout or hangs

**Solutions:**

1. **Increase Docker resources:**
   - Docker Desktop -> Settings -> Resources
   - CPU: 4+ cores
   - Memory: 6GB+
   - Swap: 2GB+

2. **Check network:**
```bash
# Test connectivity
ping -c 3 mcr.microsoft.com
curl -I https://mcr.microsoft.com
```

3. **Pre-pull image:**
```bash
docker pull mcr.microsoft.com/devcontainers/universal:2
```

4. **Build with increased timeout:**
Edit `.devcontainer/devcontainer.json`:
```json
"build": {
    "dockerfile": "Dockerfile",
    "args": {
        "BUILDKIT_INLINE_CACHE": "1"
    }
}
```

---

### Error: "Out of memory" or "JavaScript heap out of memory"

**Solutions:**

1. **Increase Node memory:**
Already configured in devcontainer.json:
```json
"containerEnv": {
    "NODE_OPTIONS": "--max-old-space-size=4096"
}
```

2. **Increase Docker memory:**
Docker Desktop -> Settings -> Resources -> Memory: 8GB

3. **Clear build cache:**
```bash
npm run clean
rm -rf .next node_modules/.cache
npm install
```

---

### Error: npm install fails with permission errors

**Solutions:**

```bash
# Fix npm cache permissions
sudo chown -R vscode:vscode ~/.npm
chmod -R 755 ~/.npm

# Clear npm cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install

# If still fails, use sudo (NOT RECOMMENDED):
# sudo npm install --unsafe-perm
```

---

## 🔄 Recovery Procedures

### Procedure 1: Soft Reset (Recommended first)
```bash
1. Cmd+Shift+P -> "Developer: Reload Window"
2. Wait 30 seconds
3. Check Antigravity status
```

### Procedure 2: Extension Reset
```bash
1. Disable Antigravity extension
2. Cmd+Shift+P -> "Developer: Reload Window"
3. Enable Antigravity extension
4. Cmd+Shift+P -> "Developer: Reload Window"
```

### Procedure 3: Container Rebuild
```bash
1. Cmd+Shift+P -> "Dev Containers: Rebuild Container"
2. Wait for rebuild (3-5 minutes)
3. Run verification: ./.devcontainer/verify-setup.sh
```

### Procedure 4: Clean Rebuild
```bash
1. Cmd+Shift+P -> "Dev Containers: Rebuild Container Without Cache"
2. Wait for rebuild (5-10 minutes)
3. Run verification: ./.devcontainer/verify-setup.sh
```

### Procedure 5: Nuclear Reset
```bash
# On host machine:
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume rm $(docker volume ls -q | grep antigravity)
docker volume rm $(docker volume ls -q | grep npm-cache)
docker system prune -a --volumes -f

# In VS Code:
# Cmd+Shift+P -> "Dev Containers: Rebuild Container"
```

---

## 📊 Health Check Script

Run this in container terminal:
```bash
./.devcontainer/verify-setup.sh
```

This will check:
- ✅ User and permissions
- ✅ Node.js version
- ✅ Directory structure
- ✅ Antigravity server
- ✅ Environment variables
- ✅ Dependencies
- ✅ Ports

---

## 🎯 Prevention Tips

### 1. Regular Checks
```bash
# Weekly:
./.devcontainer/verify-setup.sh

# Before important work:
docker stats <container>  # Check resources
df -h  # Check disk space
```

### 2. Keep Updated
```bash
# Update base image monthly:
docker pull mcr.microsoft.com/devcontainers/universal:2
# Rebuild container

# Update extensions:
# Cmd+Shift+P -> "Extensions: Check for Extension Updates"
```

### 3. Monitor Logs
```bash
# Check for warnings/errors:
grep -i "error\|warn\|exception" ~/.antigravity/server.log
```

### 4. Resource Management
```bash
# Clean unused Docker resources weekly:
docker system prune -f

# Clean npm cache:
npm cache clean --force
```

---

## 📞 Getting Help

### Information to Collect

When seeking help, provide:

1. **System Info:**
```bash
# In container:
whoami
node --version
npm --version
cat /etc/os-release

# On host:
docker --version
docker info | grep -E "Server Version|OS/Arch"
```

2. **Container Info:**
```bash
docker ps -a | grep devcontainer
docker inspect <container-name> | head -50
```

3. **Logs:**
```bash
# Antigravity logs
cat ~/.antigravity/server.log

# Container logs
docker logs <container-name> --tail 100

# Extension Host logs
# Cmd+Shift+P -> "Developer: Show Logs" -> "Extension Host"
```

4. **Configuration:**
```bash
cat .devcontainer/devcontainer.json
```

5. **Verification Output:**
```bash
./.devcontainer/verify-setup.sh > verification-output.txt 2>&1
cat verification-output.txt
```

---

## 🆘 Last Resort

If nothing works:

1. **Export your code:**
```bash
git commit -am "WIP: before container reset"
git push
```

2. **Complete reset:**
```bash
# Remove EVERYTHING
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker volume prune -f
docker system prune -a --volumes -f

# Restart Docker Desktop

# Fresh checkout:
cd ..
rm -rf deal-aggregator-facebook
git clone <repo-url>
cd deal-aggregator-facebook

# Rebuild:
# Cmd+Shift+P -> "Dev Containers: Reopen in Container"
```

3. **Verify:**
```bash
./.devcontainer/verify-setup.sh
```

---

**Last Updated**: 2025-12-08
**Maintainer**: Claude Code Agent
