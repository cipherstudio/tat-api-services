# LDAP Module

โมดูล LDAP สำหรับการยืนยันตัวตนผ่าน LDAP Server ของ TAT

## คุณสมบัติ

- 🔐 การยืนยันตัวตนผ่าน LDAP Server
- 👤 การดึงข้อมูลผู้ใช้จาก LDAP
- 📧 รองรับการดึงข้อมูล email, department, groups
- 🛡️ การจัดการ error ที่ครอบคลุม

## การตั้งค่า

### Environment Variables

เพิ่มตัวแปรต่อไปนี้ในไฟล์ `.env`:

```env
# LDAP Configuration
LDAP_URL=ldap://10.40.1.225
LDAP_BASE_DN=DC=tat,DC=or,DC=th
```

### การใช้งาน Email

- อีเมลต้องลงท้ายด้วย `@tat.or.th`
- ระบบจะตรวจสอบรูปแบบอีเมลก่อนส่งไปยัง LDAP Server
- ตัวอย่าง: `john.doe@tat.or.th`, `user123@tat.or.th`

### การใช้งาน

#### 1. LDAP Authentication

```typescript
POST /api/v1/ldap/authenticate
Content-Type: application/json

{
  "email": "john.doe@tat.or.th",
  "password": "password123"
}
```

#### 2. Response Format

```json
{
  "message": "การยืนยันตัวตนสำเร็จ",
  "user": {
    "givenName": "John",
    "mail": "john.doe@tat.or.th",
    "displayName": "John Doe",
    "department": "IT Department",
    "memberOf": [
      "CN=Users,DC=tat,DC=or,DC=th"
    ]
  }
}
```

## Error Handling

โมดูลนี้จัดการ error ต่างๆ ดังนี้:

- `401 Unauthorized` - Email ต้องลงท้ายด้วย @tat.or.th
- `401 Unauthorized` - Email หรือ password ไม่ถูกต้อง
- `500 Internal Server Error` - ไม่สามารถเชื่อมต่อกับ LDAP server ได้
- `500 Internal Server Error` - Base DN ไม่พบ
- `500 Internal Server Error` - ผู้ใช้ไม่พบใน LDAP

## การแยก Endpoints

### Auth Module (การยืนยันตัวตนปกติ)
- **Endpoint**: `/api/v1/auth/login`
- **ใช้สำหรับ**: การเข้าสู่ระบบปกติด้วย username/password
- **ผลลัพธ์**: JWT tokens สำหรับเข้าถึง API

### LDAP Module (การยืนยันตัวตนผ่าน LDAP)
- **Endpoint**: `/api/v1/ldap/authenticate`
- **ใช้สำหรับ**: การยืนยันตัวตนผ่าน LDAP Server ของ TAT
- **ผลลัพธ์**: ข้อมูลผู้ใช้จาก LDAP (ไม่สร้าง JWT tokens)

## การทดสอบ

### 1. ทดสอบการเชื่อมต่อ LDAP

```bash
# ทดสอบด้วย curl
curl -X POST http://localhost:3000/api/v1/ldap/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@tat.or.th",
    "password": "testpassword"
  }'
```

### 2. ทดสอบผ่าน Swagger

เปิดเบราว์เซอร์ไปที่ `http://localhost:3000/documentation` และทดสอบ endpoint `/ldap/authenticate`

## การพัฒนา

### การเพิ่มฟีเจอร์ใหม่

1. เพิ่ม method ใหม่ใน `LdapService`
2. เพิ่ม endpoint ใหม่ใน `LdapController`
3. เพิ่ม DTO สำหรับ request/response
4. อัปเดต Swagger documentation

### การทดสอบ

```bash
# รัน unit tests
npm run test src/modules/ldap

# รัน e2e tests
npm run test:e2e
``` 