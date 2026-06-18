# Finanzas en Familia 🏠💰

> Controla el dinero de tu hogar, sin complicaciones.

**Finanzas en Familia** es una Progressive Web App (PWA) diseñada para la gestión financiera familiar. Permite registrar ingresos, gastos, ahorros y obligaciones financieras de forma intuitiva, con un enfoque mobile-first y experiencia tipo fintech.

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| **Dashboard financiero** | Resumen de saldo disponible, ahorros y gastos del período. |
| **Onboarding guiado** | Wizard de 5 pasos para configurar ingresos, métodos de pago, vehículos, servicios y almuerzos. |
| **Registro de gastos** | Soporta contado, tarjeta de crédito (con cuotas) y débito de ahorros. |
| **Financiamiento automático** | Al elegir tarjeta con cuotas >1, se genera una obligación financiera que difiere el impacto en el flujo de caja. |
| **Gestión de almuerzos** | Grid día por día con check/uncheck y persistencia de exclusiones. |
| **Cierre de ciclo** | Cálculo automático de sobrante y opción de transferencia a bolsillo de ahorros (Nequi). |
| **PWA instalable** | Compatible con instalación en Android como app nativa. |
| **Autenticación Supabase** | Login, registro y confirmación por email con Row Level Security. |

---

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
|---|---|
| [Next.js 16](https://nextjs.org/) | Framework React con App Router y Server Components. |
| [Supabase](https://supabase.com/) | Backend como servicio (PostgreSQL, Auth, RLS). |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilos utilitarios mobile-first. |
| [base-ui](https://base-ui.com/) | Componentes headless con accesibilidad. |
| [shadcn/ui](https://ui.shadcn.com/) | Sistema de componentes basado en Tailwind. |

---

## 🚀 Empezando

```bash
# 1. Clonar el repositorio
git clone https://github.com/Keiner-2006/FINANCIAL-MANAGEMENT-APP.git
cd FINANCIAL-MANAGEMENT-APP

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 4. Iniciar en modo desarrollo
npm run dev
```

### Pre-requisitos

- Node.js 20+
- npm
- Proyecto activo en [Supabase](https://supabase.com/)

### Configuración de Supabase

1. Crear un proyecto en Supabase.
2. Ejecutar el contenido de `supabase/full_schema.sql` en el SQL Editor.
3. Copiar la URL del proyecto y la `anon key` al archivo `.env.local`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 📁 Estructura del Proyecto

```
├── app/
│   ├── auth/             # Páginas de autenticación
│   ├── dashboard/        # Dashboard principal
│   └── onboarding/       # Wizard de configuración inicial
├── components/
│   ├── dashboard/        # Componentes del dashboard
│   ├── onboarding/       # Componentes del onboarding
│   └── ui/               # Componentes base (shadcn)
├── lib/
│   ├── supabase/         # Clientes de Supabase (server/client)
│   └── types.ts          # Tipos compartidos
├── public/               # Assets estáticos y manifiesto PWA
└── supabase/
    └── full_schema.sql   # Esquema completo de base de datos
```

---

## 🔒 Seguridad

- **Row Level Security (RLS):** Cada usuario accede únicamente a sus propios datos.
- **Autenticación por email:** Confirmación de correo obligatoria.
- **Políticas de seguridad:** Implementadas a nivel de base de datos en Supabase.
- **Sin fugas de datos:** Las claves anónimas de Supabase están restringidas por RLS.

---

## 📱 PWA

La aplicación es instalable en Android y iOS:

1. Abre la app en Chrome (Android) o Safari (iOS).
2. Aparecerá un botón **"Instalar App"** en el dashboard.
3. La app se agrega a la pantalla de inicio con apariencia nativa.

---

## 🧪 Construcción para Producción

```bash
npm run build
npm start
```

---

## 📄 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.

---

Desarrollado con ❤️ para la gestión financiera familiar.
