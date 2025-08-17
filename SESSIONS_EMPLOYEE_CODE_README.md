# Sessions Employee Code Integration

## ภาพรวม

ระบบได้เพิ่ม `employee_code` คอลัมน์ในตาราง `sessions` เพื่อเชื่อมต่อกับข้อมูลพนักงานและระบบ Employee Admin

## การเปลี่ยนแปลงที่เพิ่มเข้ามา

### 1. Database Migration

#### Migration: `20250730120000_add_employee_code_to_sessions.js`
```javascript
exports.up = function (knex) {
  return knex.schema.alterTable('sessions', function (table) {
    table.string('employee_code').nullable().after('user_id');
    
    // Add index for better performance
    table.index(['employee_code']);
  });
};
```

**การเปลี่ยนแปลง:**
- เพิ่ม `employee_code` คอลัมน์ (VARCHAR, nullable)
- เพิ่ม index สำหรับ `employee_code`
- วางคอลัมน์หลัง `user_id`

### 2. Session Entity Updates

#### Entity: `src/modules/auth/entities/session.entity.ts`
```typescript
export interface Session {
  id: number;
  userId: number;
  user?: User;
  employeeCode?: string; // เพิ่มใหม่
  token: string;
  deviceInfo?: string;
  ipAddress?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**การเปลี่ยนแปลง:**
- เพิ่ม `employeeCode?: string` ใน interface
- อัพเดท column mappings สำหรับ snake_case และ camel_case

### 3. Session Repository Updates

#### Repository: `src/modules/auth/repositories/session.repository.ts`

**Methods ที่เพิ่มใหม่:**
```typescript
// ค้นหา sessions ตาม employee_code
async findActiveSessionsByEmployeeCode(employeeCode: string): Promise<Session[]>

// ระงับ sessions ทั้งหมดของ employee
async deactivateAllEmployeeSessions(employeeCode: string): Promise<number>
```

### 4. Session Service Updates

#### Service: `src/modules/auth/services/session.service.ts`

**Methods ที่อัพเดท:**
```typescript
// อัพเดท createSession เพื่อรับ employee_code
async createSession(
  userId: number,
  token: string,
  deviceInfo?: string,
  ipAddress?: string,
  employeeCode?: string, // เพิ่มใหม่
  expiresIn: number = 24 * 60 * 60 * 1000,
): Promise<Session>

// เพิ่ม methods ใหม่
async getEmployeeActiveSessions(employeeCode: string): Promise<Session[]>
async deactivateAllEmployeeSessions(employeeCode: string): Promise<void>
```

### 5. Auth Service Updates

#### Service: `src/modules/auth/auth.service.ts`

**การเปลี่ยนแปลง:**
- เพิ่ม `SessionService` ใน constructor
- อัพเดท `login` method เพื่อสร้าง session พร้อม `employee_code`

```typescript
async login(
  user: User & (Employee & ViewPosition4ot & OpLevelSalR & OpMasterT & { isAdmin?: number }),
  deviceInfo?: string,
  ipAddress?: string,
) {
  // ... existing code ...
  
  // Create session with employee_code
  const accessToken = this.jwtService.sign(payload);
  await this.sessionService.createSession(
    existingUser.id,
    accessToken,
    deviceInfo,
    ipAddress,
    user.pmtCode, // employee_code
  );
  
  // ... return tokens ...
}
```

### 6. Auth Controller Updates

#### Controller: `src/modules/auth/auth.controller.ts`

**การเปลี่ยนแปลง:**
- อัพเดท `login` method เพื่อส่ง device info และ IP address
- อัพเดท `refresh` method เพื่อจัดการ user object

```typescript
async login(@Body() loginDto: LoginDto, @Req() req: RequestWithUser) {
  const user = req.user;
  const tokens = await this.authService.login(
    user,
    req.headers['user-agent'] as string,
    req.ip,
  );
  
  // ... audit log ...
  
  return tokens;
}
```

## การใช้งาน

### 1. การสร้าง Session พร้อม Employee Code

```typescript
// ใน Auth Service
const session = await this.sessionService.createSession(
  userId,
  token,
  deviceInfo,
  ipAddress,
  employeeCode, // PMT_CODE จาก user
);
```

### 2. การค้นหา Sessions ตาม Employee Code

```typescript
// ค้นหา active sessions ของ employee
const sessions = await sessionService.getEmployeeActiveSessions('38019');

// ระงับ sessions ทั้งหมดของ employee
await sessionService.deactivateAllEmployeeSessions('38019');
```

### 3. การใช้งานใน Repository

```typescript
// ค้นหา sessions ตาม employee_code
const sessions = await sessionRepository.findActiveSessionsByEmployeeCode('38019');

// ระงับ sessions ทั้งหมดของ employee
const count = await sessionRepository.deactivateAllEmployeeSessions('38019');
```

## การเชื่อมต่อกับ Employee Admin System

### 1. การเชื่อมต่อข้อมูล
- `employee_code` ใน sessions เชื่อมต่อกับ `pmt_code` ใน `employee_admin`
- ใช้สำหรับติดตามการเข้าสู่ระบบของพนักงานที่เป็นแอดมิน

### 2. การตรวจสอบ Admin Status
```typescript
// ตรวจสอบว่า employee เป็น admin หรือไม่
const isAdmin = await dataviewsService.checkEmployeeIsAdmin('38019');

if (isAdmin) {
  // จัดการ sessions ของ admin
  const adminSessions = await sessionService.getEmployeeActiveSessions('38019');
}
```

## การทดสอบ

### 1. ทดสอบ Migration
```bash
# รัน migration
npm run migration:run

# ตรวจสอบโครงสร้างตาราง
DESCRIBE sessions;
```

### 2. ทดสอบ API
```bash
# ทดสอบ login
curl -X POST "http://localhost:3000/auth/v1/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# ตรวจสอบ session ใน database
SELECT * FROM sessions WHERE employee_code IS NOT NULL;
```

### 3. ทดสอบใน Code
```typescript
// ทดสอบการสร้าง session พร้อม employee_code
const session = await sessionService.createSession(
  1,
  'token123',
  'Chrome/91.0',
  '192.168.1.1',
  '38019'
);

expect(session.employeeCode).toBe('38019');

// ทดสอบการค้นหา sessions ตาม employee_code
const sessions = await sessionService.getEmployeeActiveSessions('38019');
expect(sessions.length).toBeGreaterThan(0);
```

## การบำรุงรักษา

### 1. การ Cleanup Sessions
```typescript
// ลบ expired sessions
const count = await sessionService.cleanupExpiredSessions();

// ระงับ sessions ของ employee ที่ถูกลบ
await sessionService.deactivateAllEmployeeSessions('38019');
```

### 2. การ Monitor Sessions
```sql
-- ดู sessions ทั้งหมดที่มี employee_code
SELECT 
  s.id,
  s.user_id,
  s.employee_code,
  s.token,
  s.is_active,
  s.created_at,
  ea.employee_name
FROM sessions s
LEFT JOIN employee_admin ea ON s.employee_code = ea.pmt_code
WHERE s.employee_code IS NOT NULL;
```

## ข้อควรระวัง

1. **Performance**: การเพิ่ม index บน `employee_code` จะช่วยเพิ่มประสิทธิภาพการค้นหา
2. **Data Consistency**: ต้องแน่ใจว่า `employee_code` ใน sessions สอดคล้องกับข้อมูลใน `employee_admin`
3. **Security**: ตรวจสอบสิทธิ์การเข้าถึงก่อนแสดงข้อมูล sessions
4. **Privacy**: ระวังการเปิดเผยข้อมูล sessions ที่มี `employee_code`

## การ Rollback

หากต้องการ rollback การเปลี่ยนแปลง:

```bash
# Rollback migration
npm run migration:rollback

# หรือลบคอลัมน์ด้วย SQL
ALTER TABLE sessions DROP COLUMN employee_code;
DROP INDEX sessions_employee_code_index;
```

## การอัพเกรดในอนาคต

1. **เพิ่ม Foreign Key**: เชื่อมต่อกับตาราง `employee_admin`
2. **เพิ่ม Audit Trail**: บันทึกการเปลี่ยนแปลง sessions
3. **เพิ่ม Analytics**: วิเคราะห์การใช้งานตาม employee_code
4. **เพิ่ม Notifications**: แจ้งเตือนเมื่อมีการ login ผิดปกติ 