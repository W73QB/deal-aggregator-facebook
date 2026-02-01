# 🚀 Hướng Dẫn Dev Container với Antigravity Extension

## 📖 Giới Thiệu

File devcontainer.json này được thiết kế để chạy ổn định với Antigravity extension, giải quyết các vấn đề về permissions, Node.js version, và xung đột CLI.

---

## 🔍 Giải Thích Thiết Kế

### **1. Base Image & User Configuration**
```json
"image": "mcr.microsoft.com/devcontainers/universal:2"
"remoteUser": "vscode"
```
- **Lý do**: Universal image đã có sẵn nhiều tools, tối ưu cho development
- **remoteUser "vscode"**: User non-root an toàn, có đủ privileges cho development
- **updateRemoteUserUID**: Đồng bộ UID với host machine để tránh permission issues

### **2. Node.js Features**
```json
"features": {
    "ghcr.io/devcontainers/features/node:1": {
        "version": "18",
        "nodeGypDependencies": true,
        "nvmVersion": "latest"
    }
}
```
- **Node.js 18**: Version tối thiểu cho Antigravity
- **nodeGypDependencies**: Compile native modules (bcrypt, pg-native, etc.)
- **nvmVersion**: Cho phép switch Node versions khi cần

### **3. Lifecycle Commands (QUAN TRỌNG NHẤT)**

#### **onCreateCommand** (Chạy 1 lần khi build container)
```bash
mkdir -p ~/.antigravity ~/.npm ~/.config ~/.vscode-server
chmod -R 755 ~ || true
```
- Tạo directories cần thiết
- Set base permissions

#### **postCreateCommand** (Sau khi container được tạo)
```bash
mkdir -p ~/.antigravity ~/.vscode-server ~/.config &&
chmod -R 755 ~/ &&
chmod -R 755 /workspaces/${localWorkspaceFolderBasename} &&
npm install
```
- Đảm bảo tất cả directories tồn tại
- Fix workspace permissions
- Install dependencies

#### **postStartCommand** (Mỗi lần container start)
```bash
mkdir -p ~/.antigravity ~/.vscode-server ~/.config &&
chmod -R 755 ~/.antigravity ~/.vscode-server ~/.config &&
touch ~/.antigravity/server.log &&
chmod 644 ~/.antigravity/server.log &&
echo "Antigravity directories initialized at $(date)" >> ~/.antigravity/server.log
```
- Reinitialize directories (case container restart)
- Tạo log file với permissions đúng
- Log initialization time để debug

### **4. Environment Variables**
```json
"containerEnv": {
    "ANTIGRAVITY_HOME": "/home/vscode/.antigravity",
    "npm_config_cache": "/home/vscode/.npm",
    "NODE_OPTIONS": "--max-old-space-size=4096"
}
```
- **ANTIGRAVITY_HOME**: Chỉ định nơi Antigravity lưu data
- **npm_config_cache**: Cache npm packages để tăng tốc builds
- **NODE_OPTIONS**: Tránh out-of-memory với Next.js builds

### **5. Persistent Volumes**
```json
"mounts": [
    "source=deal-aggregator-npm-cache,target=/home/vscode/.npm,type=volume",
    "source=antigravity-data,target=/home/vscode/.antigravity,type=volume"
]
```
- **npm-cache volume**: Giữ packages giữa các container rebuilds
- **antigravity-data volume**: Persist Antigravity server data & settings
- **Không override workspace mount**: Để VS Code tự động handle

### **6. VS Code Settings cho Antigravity**
```json
"antigravity.serverPath": "/home/vscode/.antigravity",
"antigravity.logLevel": "debug",
"antigravity.autoStart": true
```
- **serverPath**: Explicit path để tránh confusion
- **logLevel debug**: Dễ troubleshoot issues
- **autoStart**: Tự động start extension server

### **7. Security & Performance**
```json
"runArgs": ["--init", "--memory=4g", "--cpus=2"],
"capAdd": ["SYS_PTRACE"],
"securityOpt": ["seccomp=unconfined"]
```
- **--init**: Proper process reaping (tránh zombie processes)
- **memory=4g**: Đủ cho Next.js builds
- **SYS_PTRACE**: Cho debuggers
- **seccomp=unconfined**: Giảm restrictions cho extension servers

---

## 📝 HƯỚNG DẪN STEP-BY-STEP

### **Bước 1: Chuẩn Bị**
```bash
# Đảm bảo Docker đang chạy
docker --version

# Đảm bảo VS Code có Remote-Containers extension
code --list-extensions | grep ms-vscode-remote.remote-containers
```

### **Bước 2: Rebuild Container**
1. Mở VS Code
2. `Cmd+Shift+P` (Mac) hoặc `Ctrl+Shift+P` (Windows/Linux)
3. Gõ: **"Dev Containers: Rebuild Container"**
4. Chờ container build (3-5 phút lần đầu)

### **Bước 3: Kiểm Tra Antigravity Status**
Sau khi container rebuild xong:

```bash
# Terminal trong container
whoami
# Output: vscode

# Kiểm tra Node.js version
node --version
# Output: v18.x.x

# Kiểm tra directories
ls -la ~ | grep antigravity
# Output: drwxr-xr-x ... .antigravity

# Kiểm tra Antigravity log
cat ~/.antigravity/server.log
# Nên thấy: "Antigravity directories initialized at..."

# Kiểm tra permissions
ls -ld ~/.antigravity
# Output: drwxr-xr-x 2 vscode vscode ...
```

### **Bước 4: Verify Antigravity Extension**
1. Mở Command Palette (`Cmd+Shift+P`)
2. Gõ: **"Antigravity: Show Status"**
3. Kiểm tra output:
   - ✅ Server Status: Running
   - ✅ Server Path: /home/vscode/.antigravity
   - ✅ Node Version: 18.x.x

### **Bước 5: Test Extension Functionality**
```bash
# Test Antigravity với một prompt đơn giản
# Trong VS Code, mở Antigravity panel và test:
# "Create a simple hello world function"
```

### **Bước 6: Test Application**
```bash
# Install dependencies (nếu chưa)
npm install

# Test dev server
npm run dev

# Truy cập http://localhost:3000
```

---

## ⚠️ LỖI PHỔ BIẾN & CÁCH XỬ LÝ

### **Lỗi 1: "Process exited with code 1"**

**Nguyên nhân:**
- Antigravity không tạo được ~/.antigravity

**Giải pháp:**
```bash
# Trong container terminal:
mkdir -p ~/.antigravity
chmod 755 ~/.antigravity
# Reload window: Cmd+Shift+P -> "Developer: Reload Window"
```

### **Lỗi 2: "EACCES: permission denied"**

**Nguyên nhân:**
- File/folder ownership sai

**Giải pháp:**
```bash
# Check ownership
ls -la ~/.antigravity

# Fix ownership (trong container)
sudo chown -R vscode:vscode ~/.antigravity
chmod -R 755 ~/.antigravity

# Fix workspace permissions
sudo chown -R vscode:vscode /workspaces/*
```

### **Lỗi 3: "Node version not found" hoặc "node: not found"**

**Nguyên nhân:**
- Node.js feature chưa install đúng

**Giải pháp:**
```bash
# Rebuild container
# Cmd+Shift+P -> "Dev Containers: Rebuild Container Without Cache"

# Hoặc verify Node trong container:
which node
node --version
```

### **Lỗi 4: Antigravity extension không autostart**

**Nguyên nhân:**
- Extension settings chưa được apply

**Giải pháp:**
```bash
# Check VS Code settings trong container:
code ~/.vscode-server/data/Machine/settings.json

# Manual start extension:
# Cmd+Shift+P -> "Antigravity: Start Server"
```

### **Lỗi 5: "Cannot find module" errors**

**Nguyên nhân:**
- npm dependencies chưa install

**Giải pháp:**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Hoặc clear npm cache
npm cache clean --force
npm install
```

### **Lỗi 6: Container build timeout**

**Nguyên nhân:**
- Slow network hoặc Docker resources không đủ

**Giải pháp:**
```bash
# Tăng Docker resources:
# Docker Desktop -> Settings -> Resources
# - CPUs: 4+
# - Memory: 6GB+
# - Swap: 2GB+

# Hoặc build với timeout dài hơn
docker build --timeout=600 ...
```

### **Lỗi 7: "Port 3000 already in use"**

**Giải pháp:**
```bash
# Trong container:
lsof -ti:3000 | xargs kill -9

# Hoặc change port:
PORT=3001 npm run dev
```

---

## 🔧 DEBUGGING TIPS

### **1. Check Container Logs**
```bash
# Docker logs
docker logs <container-name>

# Trong VS Code:
# Cmd+Shift+P -> "Dev Containers: Show Container Log"
```

### **2. Inspect Running Processes**
```bash
# Trong container
ps aux | grep antigravity
ps aux | grep node
```

### **3. Check Environment Variables**
```bash
env | grep -i antigravity
env | grep -i node
```

### **4. Test Permissions Systematically**
```bash
# Test write permission
touch ~/.antigravity/test.txt && echo "Write OK" || echo "Write FAILED"

# Test read permission
cat ~/.antigravity/server.log && echo "Read OK" || echo "Read FAILED"

# Test execute permission
ls ~/.antigravity && echo "Execute OK" || echo "Execute FAILED"
```

### **5. Antigravity Server Logs**
```bash
# Tail server logs real-time
tail -f ~/.antigravity/server.log

# Check for errors
grep -i error ~/.antigravity/server.log
grep -i exception ~/.antigravity/server.log
```

### **6. Check VS Code Extension Host Log**
```bash
# Cmd+Shift+P -> "Developer: Show Logs"
# Select "Extension Host"
```

---

## 🎯 VERIFICATION CHECKLIST

Sau khi setup xong, verify các items sau:

- [ ] Container running: `docker ps | grep antigravity`
- [ ] User is vscode: `whoami` = vscode
- [ ] Node.js ≥18: `node --version`
- [ ] ~/.antigravity exists: `ls -la ~/.antigravity`
- [ ] Correct permissions: `ls -ld ~/.antigravity` shows vscode:vscode
- [ ] Antigravity extension installed: Check Extensions panel
- [ ] Extension server running: "Antigravity: Show Status"
- [ ] No permission errors: Check Output panel
- [ ] Dev server works: `npm run dev` accessible at localhost:3000
- [ ] Hot reload works: Edit file and see changes

---

## 📚 RESOURCES

- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [Dev Container Features](https://containers.dev/features)
- [Antigravity Extension](https://marketplace.visualstudio.com/items?itemName=google.antigravity-agent)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)

---

## 💡 PRO TIPS

1. **Persist Settings Across Rebuilds**: Sử dụng volumes cho cả ~/.vscode-server
2. **Speed Up Builds**: Pre-pull base image: `docker pull mcr.microsoft.com/devcontainers/universal:2`
3. **Clean State**: Rebuild without cache khi có issues: "Rebuild Container Without Cache"
4. **Monitor Resources**: `docker stats <container>` để xem resource usage
5. **Backup Config**: Commit devcontainer.json vào git
6. **Team Sync**: Tất cả team members dùng same devcontainer.json

---

## 🆘 SUPPORT

Nếu vẫn gặp issues sau khi follow guide này:

1. **Rebuild Without Cache**: Cmd+Shift+P -> "Rebuild Container Without Cache"
2. **Check Docker**: Restart Docker Desktop
3. **Clear Everything**: Remove container, volumes, và rebuild fresh
4. **Check Logs**: Antigravity server log, container log, extension host log
5. **Update Extensions**: Ensure Antigravity extension is latest version

```bash
# Nuclear option - fresh start:
docker system prune -a --volumes
# Cmd+Shift+P -> "Dev Containers: Rebuild Container"
```

---

**Last Updated**: 2025-12-08
**Author**: Claude Code Agent
**Version**: 1.0.0
