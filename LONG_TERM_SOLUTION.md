# Long-Term Solution สำหรับแก้ไข ECONNRESET และ Connection Issues

## 🎯 เป้าหมาย

แก้ไข root cause ของ ECONNRESET errors เพื่อป้องกันไม่ให้เกิดปัญหาซ้ำๆ และลดความจำเป็นในการ restart service

## 📋 สาเหตุหลักของ ECONNRESET

### 1. **Database Connection Issues**
- Oracle database connection timeout
- Connection pool หมด
- Network instability ระหว่าง application กับ database
- Database maintenance หรือ restart

### 2. **Network Infrastructure Issues**
- Load balancer timeout settings
- Firewall rules ที่ปิด idle connections
- Network packet loss
- Network latency สูง

### 3. **Application-Level Issues**
- Long-running queries
- Connection leaks (connections ไม่ถูก cleanup)
- Connection pool configuration ไม่เหมาะสม
- ไม่มี connection health monitoring

## 🔧 Long-Term Solutions

### 1. **Database Level (DBA/Infrastructure Team)**

#### A. เพิ่ม UNDO_RETENTION และ Undo Tablespace
```sql
-- เพิ่ม UNDO_RETENTION เพื่อป้องกัน ORA-01555
ALTER SYSTEM SET UNDO_RETENTION = 3600; -- 1 ชั่วโมง

-- เพิ่ม undo tablespace size
ALTER TABLESPACE UNDOTBS1 ADD DATAFILE '/path/to/undo02.dbf' SIZE 2G;
```

#### B. ปรับ Oracle Connection Settings
```sql
-- เพิ่ม SQLNET.EXPIRE_TIME สำหรับ keepalive
-- ในไฟล์ $ORACLE_HOME/network/admin/sqlnet.ora
SQLNET.EXPIRE_TIME = 10  -- Ping connection ทุก 10 นาที
```

#### C. ปรับ Connection Pool Settings ใน Oracle
```sql
-- ตรวจสอบและปรับ connection limits
SELECT * FROM V$RESOURCE_LIMIT WHERE RESOURCE_NAME LIKE '%SESSION%';
SELECT * FROM V$RESOURCE_LIMIT WHERE RESOURCE_NAME LIKE '%PROCESS%';
```

### 2. **Network Infrastructure Level**

#### A. Load Balancer Configuration
- เพิ่ม idle timeout เป็น 60-120 วินาที
- ใช้ TCP keepalive
- ตรวจสอบ health check settings

#### B. Firewall Rules
- ตรวจสอบว่า firewall ไม่ปิด idle connections
- ใช้ connection tracking
- เพิ่ม timeout สำหรับ database connections

#### C. Network Monitoring
- Monitor network latency และ packet loss
- ตั้ง alert เมื่อ latency สูง
- ตรวจสอบ network stability

### 3. **Application Level**

#### A. Connection Pool Optimization (✅ ทำแล้ว)
- ปรับ timeout settings ให้เหมาะสม
- เพิ่ม connection health check
- Force cleanup dead connections

#### B. Query Optimization
- Optimize long-running queries
- เพิ่ม indexes ที่จำเป็น
- ใช้ pagination สำหรับ large datasets
- หลีกเลี่ยง N+1 queries

#### C. Connection Management
- ใช้ connection pooling อย่างถูกต้อง
- Cleanup connections หลังใช้งาน
- Monitor connection pool usage
- Alert เมื่อ pool ใกล้หมด

#### D. Retry Logic (✅ ทำแล้ว)
- Retry สำหรับ recoverable errors
- Exponential backoff
- Circuit breaker pattern

### 4. **Monitoring & Alerting**

#### A. Application Monitoring
- Monitor ECONNRESET frequency
- Track connection pool usage
- Monitor query performance
- Alert เมื่อ connection issues เกิดบ่อย

#### B. Database Monitoring
- Monitor database connections
- Track connection timeouts
- Monitor database performance
- Alert เมื่อ database issues

#### C. Network Monitoring
- Monitor network latency
- Track packet loss
- Monitor connection stability
- Alert เมื่อ network issues

## 📊 Implementation Plan

### Phase 1: Immediate (✅ ทำแล้ว)
- [x] เพิ่ม ECONNRESET error handling
- [x] เพิ่ม connection pool error handlers
- [x] เพิ่ม connection health check
- [x] เพิ่ม request timeout
- [x] ปรับ connection pool configuration

### Phase 2: Short-term (1-2 สัปดาห์)
- [ ] เพิ่ม health check endpoint
- [ ] เพิ่ม auto-restart mechanism (health check + Docker)
- [ ] เพิ่ม monitoring dashboard
- [ ] เพิ่ม alerting สำหรับ connection issues
- [ ] Optimize queries ที่ใช้เวลานาน

### Phase 3: Medium-term (1-2 เดือน)
- [ ] Review และ optimize database indexes
- [ ] Implement circuit breaker pattern
- [ ] เพิ่ม connection pool metrics
- [ ] Database connection monitoring
- [ ] Network stability improvements

### Phase 4: Long-term (3-6 เดือน)
- [ ] Database infrastructure improvements
- [ ] Network infrastructure optimization
- [ ] Application architecture improvements
- [ ] Comprehensive monitoring system
- [ ] Automated recovery mechanisms

## 🔍 Monitoring Metrics

### Key Metrics to Track
1. **ECONNRESET Frequency**
   - จำนวนครั้งต่อชั่วโมง/วัน
   - Pattern ของเวลาเกิด
   - Correlation กับ database/network events

2. **Connection Pool Usage**
   - Active connections
   - Idle connections
   - Connection wait time
   - Pool exhaustion events

3. **Query Performance**
   - Average query time
   - Long-running queries
   - Query timeouts
   - Failed queries

4. **Database Health**
   - Connection count
   - Active sessions
   - Database response time
   - Database errors

5. **Network Health**
   - Latency
   - Packet loss
   - Connection stability
   - Timeout events

## 📝 Best Practices

### 1. **Connection Management**
- ใช้ connection pooling
- Cleanup connections หลังใช้งาน
- Monitor pool usage
- Set appropriate timeouts

### 2. **Error Handling**
- Handle errors gracefully
- Retry recoverable errors
- Log errors สำหรับ analysis
- Alert on critical errors

### 3. **Query Optimization**
- ใช้ indexes
- Avoid N+1 queries
- Use pagination
- Optimize joins

### 4. **Monitoring**
- Monitor key metrics
- Set up alerts
- Regular review
- Continuous improvement

## 🎯 Success Criteria

### Short-term (1 เดือน)
- ลด ECONNRESET frequency ลง 50%
- ลด manual restarts ลง 80%
- Connection pool health check ทำงาน

### Medium-term (3 เดือน)
- ลด ECONNRESET frequency ลง 80%
- ไม่ต้อง manual restart (auto-recovery)
- Query performance ดีขึ้น 30%

### Long-term (6 เดือน)
- ECONNRESET เกิดน้อยมาก (< 1 ครั้ง/วัน)
- Zero downtime จาก connection issues
- Stable และ reliable system

## 📚 References

- [Oracle Connection Pooling Best Practices](https://docs.oracle.com/en/database/oracle/oracle-database/)
- [Node.js Connection Pool Management](https://nodejs.org/en/docs/)
- [Knex.js Connection Pool Configuration](https://knexjs.org/guide/)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)

## 🔄 Continuous Improvement

1. **Regular Review**
   - Review metrics สัปดาห์ละครั้ง
   - Analyze error patterns
   - Identify improvement opportunities

2. **Incremental Improvements**
   - Implement improvements ทีละขั้น
   - Test และ validate
   - Monitor results

3. **Documentation**
   - Document changes
   - Update runbooks
   - Share knowledge

4. **Team Collaboration**
   - Work with DBA team
   - Coordinate with infrastructure team
   - Share learnings

