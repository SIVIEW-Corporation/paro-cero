# Sistema de Autenticación — API

## Resumen General

El backend usa JWT (JSON Web Tokens) con un patrón de Access Token + Refresh Token con rotación. Los access tokens son de corta duración (15 min) y los refresh tokens son UUIDs almacenados en la base de datos con expiración de 1 día.

---

## 📋 Endpoints

Todos bajo el prefijo /api/v1/auth:

### 1.POST /api/v1/auth/login — Autenticación inicial

Request Body:
{
"email": "usuario@empresa.com",
"password": "password123"
}
Response (200 OK):
{
"access_token": "eyJhbGciOiJIUzI1NiIs...",
"refresh_token": "550e8400-e29b-41d4-a716-446655440000",
"token_type": "bearer",
"expires_in": 900,
"user": {
"id": "uuid-del-usuario",
"email": "usuario@empresa.com",
"name": "Nombre Completo",
"role": "admin",
"company_id": "uuid-de-la-empresa",
"is_active": true
}
}

Errores:

- 400 → "Credenciales inválidas" (email no existe o password incorrecto)
- 400 → "Usuario inactivo" (usuario existe pero is_active = false)

---

### 2.POST /api/v1/auth/refresh — Renovar tokens

Request Body:
{
"refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
Response (200 OK): Mismo formato que el login (nuevo access_token, nuevo refresh_token, datos del usuario).

⚠️ IMPORTANTE — Token Rotation:

- Cada vez que llamás a /refresh, el refresh token anterior se revoca y se genera uno nuevo.
- El frontend DEBE guardar el nuevo refresh_token de la respuesta y usarlo en el próximo refresh.
- Si intentás reusar un refresh token ya usado, vas a recibir 400 → "Refresh token expirado o revocado".
  Errores:
- 400 → "Refresh token inválido" (formato no es UUID válido)
- 400 → "Refresh token expirado o revocado" (token ya fue usado, expiró, o fue revocado)

---

### 3. POST /api/v1/auth/logout — Cerrar sesión

Request Body:
{
"refresh_token": "550e8400-e29b-41d4-a716-446655440000"
}
Headers requeridos: Authorization: Bearer <access_token> (requiere autenticación)
Response (200 OK):
{
"message": "Logout exitoso"
}
Errores:

- 400 → "Refresh token inválido" (formato no UUID)
- 400 → "Refresh token no encontrado" (token ya fue revocado)
- 401 → Si el access token es inválido o expirado

---

## 🔑 JWT Access Token — Claim

El access token es un JWT firmado con HS256. Contiene estos claims:

| Claim      | Valor                      | Ejemplo                                |
| :--------- | :------------------------- | :------------------------------------- |
| sub        | User ID (UUID string)      | "123e4567-e89b-12d3-a456-426614174000" |
| role       | Rol del usuario            | "admin", "user", "superadmin"          |
| company_id | Company ID (UUID string)   | "abc12345-..."                         |
| exp        | Expiración (timestamp UTC) | Automático                             |

Para requests autenticados: Enviar header Authorization: Bearer <access_token>

---

## ⏱️ Valores de Expiración (configurables en .env)

Token
Access Token
Refresh Token
El expires_in en la respuesta está en segundos (900 = 15 min).

---

## 🔐 Hashing de Passwords

- Algoritmo: bcrypt (vía passlib)
- El frontend envía el password en texto plano por HTTPS. El backend lo hashea con bcrypt.

---

## 🛡️ Protección de Rutas

Las rutas protegidas usan la dependencia CurrentUserDep que:

1. Extrae el token del header Authorization: Bearer <token>
2. Decodifica y valida el JWT
3. Busca el usuario en la base de datos
4. Verifica que esté activo

Roles: Existe require_role("admin", "superadmin") para restringir por rol.
Errores de autenticación:

- 401 → "Token inválido o expirado" (token mal formado, expirado, o sin token)
- 403 → "Usuario inactivo" (token válido pero usuario desactivado)
- 403 → "No tienes permisos para realizar esta acción" (rol insuficiente)

---

## 🔄 Flujo Completo para el Frontend

1. LOGIN
   POST /api/v1/auth/login { email, password }
   → Guardar access_token y refresh_token
2. REQUESTS AUTENTICADOS
   Header: Authorization: Bearer <access_token>
3. CUANDO EL ACCESS TOKEN EXPIRA (401)
   POST /api/v1/auth/refresh { refresh*token: <el*último_guardado> }
   → Reemplazar AMBOS tokens con los nuevos de la respuesta
   → Reintentar el request original con el nuevo access_token
4. LOGOUT
   POST /api/v1/auth/logout { refresh_token }
   Header: Authorization: Bearer <access_token>
   → Limpiar todos los tokens del storage

---

## ⚠️ Puntos Críticos para el Frontend

1. **Token Rotation:** El refresh token cambia en CADA llamada a `/refresh`. El viejo queda invalidado. Si no guardás el nuevo, quedás fuera.
2. **Manejo de 401:** Cuando un request da 401, intentar refresh. Si el refresh también falla (400), forzar login de nuevo.
3. **Storage seguro:** Guardar tokens en `httpOnly cookies` preferentemente, o al menos en `localStorage` con HTTPS obligatorio.
4. **Race condition:** Si múltiples requests fallan simultáneamente con 401, hacer UN solo refresh y reintentar todos con el nuevo token.
5. **El refresh token es un UUID**, no un JWT. Es una string tipo `"550e8400-e29b-41d4-a716-446655440000"`.
