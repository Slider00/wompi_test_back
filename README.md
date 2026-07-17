# Wompi Checkout - Backend API (NestJS)

Backend del proyecto de prueba técnica para Wompi, desarrollado con NestJS y MongoDB. Maneja la autenticación, catálogo de productos, control de stock y la integración con la pasarela de pagos Wompi (Sandbox).

---

## 🚀 Arquitectura

Estructura organizada en capas para separar responsabilidades:
- **controllers**: Manejo de rutas HTTP y validación de esquemas (DTOs).
- **services**: Lógica de negocio (procesamiento de cargos, firmas de integridad, control de stock).
- **schemas**: Modelos Mongoose para la base de datos MongoDB.
- **Wompi Service**: Capa aislada para llamadas HTTP a la pasarela de Wompi.

---

## 🛠️ Instalación y Uso

### Prerrequisitos
Tener instalado Node.js (v18+) y una base de datos MongoDB (local o en la nube).

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno (crear archivo `.env` en la raíz):
   ```env
   PORT=3000
   APP_ENV=production
   TEST_VAR=hola_prod
   MONGODB_URI=mongodb+srv://wompi:BqLYGXMaiUT2A8Jk6@wompitest.jgn8hgg.mongodb.net/wompi_prod?retryWrites=true&w=majority&appName=WompiTest
   JWT_SECRET=wompi_secure_secret_change_me_in_prod
   JWT_EXPIRATION=3600s

   WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
   WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
   WOMPI_INTEGRITY_SECRET=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp
   WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
   ```

3. Correr el servidor en desarrollo:
   ```bash
   npm run start:dev
   ```
   La documentación de Swagger estará disponible en: `http://localhost:3000/api`

---

## 🧪 Pruebas Unitarias

Ejecutar la suite de pruebas:
```bash
npm run test
```

Ver reporte de cobertura:
```bash
npm run test:cov
```

---

## ☁️ Despliegue en la Nube

El backend está desplegado en producción en las siguientes URL:
- **API URL**: `https://wompi-test-back.onrender.com`
- **Swagger Docs**: `https://wompi-test-back.onrender.com/api`
- **Hosting**: Render Cloud
- **Base de datos**: MongoDB Atlas
