# คู่มือ Auto-Restart Container เมื่อ Unhealthy

## 📋 สรุปปัญหา

- Application ทำงานได้หลัง restart แต่จะ hang/ไม่ตอบสนองหลังจากทำงานไปสักพัก
- Restart แก้ได้ชั่วคราว แต่ปัญหายังเกิดซ้ำ
- สาเหตุ: ECONNRESET errors สะสมทำให้ application hang

## 🔧 วิธีแก้ไข

### วิธีที่ 1: เพิ่ม Health Check ใน Docker Compose (แนะนำ)

#### สำหรับ Production/Staging:

แก้ไข `docker-compose.prod.yml` หรือ `docker-compose.staging.yml`:

```yaml
services:
  tat-api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/ || exit 1"]
      interval: 30s          # Check every 30 seconds
      timeout: 10s           # Timeout after 10 seconds
      retries: 3             # Retry 3 times before marking as unhealthy
      start_period: 40s     # Give 40 seconds for startup
    restart: always          # Auto-restart when unhealthy
```

#### สำหรับ Development:

แก้ไข `docker-compose.yml`:

```yaml
services:
  tat-api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/ || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

**หมายเหตุ**: ต้องติดตั้ง `curl` ใน Docker image หรือใช้ `wget` แทน:

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/v1/ || exit 1"]
```

### วิธีที่ 2: ใช้ Monitoring Script

1. **ทำให้ script executable:**
   ```bash
   chmod +x scripts/monitor-container.sh
   ```

2. **รัน script:**
   ```bash
   ./scripts/monitor-container.sh
   ```

3. **รันใน background (แนะนำ):**
   ```bash
   nohup ./scripts/monitor-container.sh > monitor.log 2>&1 &
   ```

4. **รันเป็น systemd service (สำหรับ production):**
   
   สร้างไฟล์ `/etc/systemd/system/tat-api-monitor.service`:
   ```ini
   [Unit]
   Description=TAT API Container Health Monitor
   After=docker.service
   Requires=docker.service

   [Service]
   Type=simple
   User=tatadmin
   WorkingDirectory=/home/tatadmin/tat-api-services
   ExecStart=/home/tatadmin/tat-api-services/scripts/monitor-container.sh
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

   Enable และ start service:
   ```bash
   sudo systemctl enable tat-api-monitor
   sudo systemctl start tat-api-monitor
   sudo systemctl status tat-api-monitor
   ```

### วิธีที่ 3: ใช้ Cron Job สำหรับ Auto-Restart

เพิ่มใน crontab (`crontab -e`):

```bash
# Check container health every 5 minutes and restart if unhealthy
*/5 * * * * /usr/bin/docker inspect --format='{{.State.Health.Status}}' tat-api-services-tat-api-1 2>/dev/null | grep -q unhealthy && /usr/bin/docker restart tat-api-services-tat-api-1 || true
```

## 🔍 ตรวจสอบ Health Check

```bash
# ดู health check status
docker inspect tat-api-services-tat-api-1 | jq '.[0].State.Health'

# ดู health check logs
docker inspect tat-api-services-tat-api-1 --format='{{json .State.Health}}' | jq '.'

# ดู container status
docker ps | grep tat-api
```

## 📊 Monitoring

### ตรวจสอบ Frequency ของ Restart

```bash
# ดู restart count
docker inspect tat-api-services-tat-api-1 | jq '.[0].RestartCount'

# ดู restart history
docker inspect tat-api-services-tat-api-1 | jq '.[0].State.StartedAt, .[0].State.FinishedAt'
```

### ตรวจสอบ ECONNRESET Frequency

```bash
# นับจำนวน ECONNRESET ต่อวัน
grep -c "ECONNRESET" logs/exceptions-*.log

# ดู pattern ของเวลาเกิด
cat logs/exceptions-*.log | jq -r '.date' | cut -d'T' -f1 | sort | uniq -c
```

## ⚠️ หมายเหตุ

1. **Health Check ต้องมี endpoint ที่ตอบสนอง:**
   - ปัจจุบันไม่มี `/api/v1/health` endpoint
   - ใช้ `/api/v1/` แทน (root endpoint)
   - หรือสร้าง health endpoint ใหม่

2. **Restart Policy:**
   - `always`: Restart เสมอ (แนะนำสำหรับ production)
   - `unless-stopped`: Restart ยกเว้นถูก stop manual (แนะนำสำหรับ development)

3. **Health Check Interval:**
   - `interval: 30s`: ตรวจสอบทุก 30 วินาที
   - `retries: 3`: ลอง 3 ครั้งก่อน mark เป็น unhealthy
   - `start_period: 40s`: ให้เวลา 40 วินาทีสำหรับ startup

## 🎯 คำแนะนำ

1. **สำหรับ Production:**
   - ใช้ health check ใน docker-compose
   - ใช้ `restart: always`
   - Monitor restart frequency

2. **สำหรับ Development:**
   - ใช้ monitoring script
   - ใช้ `restart: unless-stopped`

3. **Long-term Solution:**
   - แก้ไข root cause ของ ECONNRESET
   - ปรับปรุง connection pool management
   - เพิ่ม connection cleanup logic

## 📝 สรุป

- **Short-term**: ใช้ health check + auto-restart
- **Medium-term**: ใช้ monitoring script
- **Long-term**: แก้ไข root cause ของ ECONNRESET

