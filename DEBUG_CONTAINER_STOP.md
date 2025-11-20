# คู่มือตรวจสอบสาเหตุ Container หยุดทำงาน

## 🔍 จุดที่ควรตรวจสอบ

### 1. Docker Logs (สำคัญที่สุด!)
```bash
# ดู logs ของ container
docker logs tat-api

# ดู logs แบบ real-time
docker logs -f tat-api

# ดู logs ล่าสุด 100 บรรทัด
docker logs --tail 100 tat-api

# ดู logs พร้อม timestamp
docker logs -t tat-api

# ดู logs ของ Docker Compose
docker-compose logs tat-api
docker-compose logs -f tat-api
```

### 2. Application Logs ในโฟลเดอร์ `logs/`

#### 2.1 Error Logs
```bash
# ดู error logs ล่าสุด
tail -f logs/error-*.log

# หา errors ในทุกไฟล์
grep -i "error" logs/error-*.log | tail -20

# ดู error logs พร้อม timestamp
cat logs/error-*.log | jq 'select(.level == "error")' | tail -20
```

#### 2.2 Exception Logs
```bash
# ดู uncaught exceptions
cat logs/exceptions-*.log | tail -50

# หรือใช้ jq
cat logs/exceptions-*.log | jq '.' | tail -50
```

#### 2.3 Rejection Logs (Unhandled Promise Rejections)
```bash
# ดู unhandled promise rejections
cat logs/rejections-*.log | tail -50

# หรือใช้ jq
cat logs/rejections-*.log | jq '.' | tail -50
```

#### 2.4 Application Logs (รวมทุกอย่าง)
```bash
# ดู logs ล่าสุด
tail -f logs/application-*.log

# หา logs ที่เกี่ยวข้องกับ shutdown/crash
grep -i "shutdown\|crash\|exit\|fatal\|killed" logs/application-*.log

# ดู logs ก่อน container หยุด (ดู timestamp)
cat logs/application-*.log | jq 'select(.timestamp > "2024-01-15T10:00:00")' | tail -50
```

### 3. ตรวจสอบ System Resources

```bash
# ตรวจสอบ memory usage
docker stats tat-api

# ตรวจสอบ disk space
df -h

# ตรวจสอบ container resource limits
docker inspect tat-api | grep -i memory
docker inspect tat-api | grep -i cpu
```

### 4. ตรวจสอบ Database Connection Issues

```bash
# ดู logs ที่เกี่ยวข้องกับ database
grep -i "database\|oracle\|connection\|timeout\|ECONNRESET\|ETIMEDOUT" logs/application-*.log | tail -50

# ดู error logs ที่เกี่ยวกับ database
grep -i "database\|oracle\|connection" logs/error-*.log | tail -50
```

### 5. ตรวจสอบ Docker Events

```bash
# ดู Docker events (ต้องรันก่อน container หยุด)
docker events

# หรือดู events ที่ผ่านมา
docker events --since 24h --until now | grep tat-api
```

### 6. ตรวจสอบ Container Status

```bash
# ดู container status และ exit code
docker ps -a | grep tat-api

# ดู exit code และ reason
docker inspect tat-api | grep -i "exitcode\|state\|status"

# ดู restart count
docker inspect tat-api | grep -i "restartcount"
```

### 7. ตรวจสอบ OOM (Out of Memory) Killer

```bash
# ตรวจสอบ system logs สำหรับ OOM
dmesg | grep -i "killed\|oom\|out of memory"

# หรือ
journalctl -k | grep -i "killed\|oom"
```

### 8. ตรวจสอบ Health Checks (ถ้ามี)

```bash
# ดู health check status
docker inspect tat-api | grep -A 10 "Health"

# ดู health check logs
docker inspect tat-api --format='{{json .State.Health}}' | jq '.'
```

## 🎯 คำสั่งที่แนะนำให้รันทันที

```bash
# 1. ดู Docker logs ล่าสุด
docker logs --tail 200 -t tat-api

# 2. ดู error logs
tail -100 logs/error-*.log

# 3. ดู exceptions
tail -100 logs/exceptions-*.log

# 4. ดู rejections
tail -100 logs/rejections-*.log

# 5. ดู application logs ก่อนหยุด
tail -200 logs/application-*.log

# 6. ตรวจสอบ container status
docker inspect tat-api | jq '.[0].State'
```

## 🔧 สาเหตุที่เป็นไปได้

### 1. **ECONNRESET (Connection Reset) - ⚠️ สาเหตุที่พบบ่อย**
- **อาการ**: Container หยุดทำงานโดยไม่มี error log ชัดเจน
- **สาเหตุ**: TCP connection ถูก reset โดยฝั่งตรงข้าม (Database, WebSocket, HTTP)
- **ตรวจสอบ**: 
  ```bash
  # ดู exceptions log
  cat logs/exceptions-*.log | grep -i "ECONNRESET"
  
  # ดู error code -104
  cat logs/exceptions-*.log | jq 'select(.error.errno == -104)'
  ```
- **วิธีแก้ไข**: 
  - ✅ **แก้ไขแล้ว**: เพิ่ม error handling ใน `src/main.ts` เพื่อ handle ECONNRESET gracefully
  - ✅ **แก้ไขแล้ว**: เพิ่ม error handling ใน database connection pool
  - ✅ **แก้ไขแล้ว**: เพิ่ม error handling ใน WebSocket connections
- **หมายเหตุ**: ECONNRESET errors จะไม่ทำให้ container crash อีกต่อไป (หลังแก้ไข)

### 2. **Out of Memory (OOM)**
- Container ใช้ memory เกิน limit
- ตรวจสอบ: `docker stats`, `dmesg | grep -i oom`

### 3. **Database Connection Lost**
- Oracle connection timeout หรือ connection pool หมด
- ตรวจสอบ: `grep -i "connection\|timeout\|ECONNRESET" logs/error-*.log`

### 4. **Unhandled Promise Rejection**
- มี promise ที่ reject แต่ไม่ถูก catch
- ตรวจสอบ: `logs/rejections-*.log`

### 5. **Uncaught Exception**
- มี exception ที่ไม่ถูก catch
- ตรวจสอบ: `logs/exceptions-*.log`

### 6. **Health Check Failed**
- Health check endpoint ไม่ตอบสนอง
- ตรวจสอบ: `docker inspect tat-api | grep -i health`

### 7. **System Resource Exhaustion**
- CPU หรือ Memory ของ host หมด
- ตรวจสอบ: `docker stats`, `top`, `htop`

### 8. **Docker Restart Policy**
- Container restart ตาม policy (`restart: unless-stopped`)
- ตรวจสอบ: `docker-compose.yml` line 29

## 📝 หมายเหตุ

- Logs ใน `logs/exceptions-*.log` และ `logs/rejections-*.log` จะช่วยบอกสาเหตุได้ดีที่สุด
- Docker logs จะแสดง console output ที่ไม่ผ่าน Winston logger
- ตรวจสอบ timestamp ใน logs เพื่อดูว่าเกิดอะไรขึ้นก่อน container หยุด

## ✅ การแก้ไขที่ทำแล้ว

### ปัญหา ECONNRESET
- ✅ เพิ่ม error handling ใน `src/main.ts` เพื่อ handle ECONNRESET gracefully
- ✅ เพิ่ม error handling ใน database connection pool (`src/database/knex-service/knex.service.ts`)
- ✅ เพิ่ม error handling ใน WebSocket connections (`src/common/utils/websocket.util.ts`)

**ผลลัพธ์**: ECONNRESET errors จะไม่ทำให้ container crash อีกต่อไป แต่จะถูก handle gracefully และ application จะยังทำงานต่อได้

