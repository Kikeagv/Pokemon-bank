# Pokémon Bank

Simulación de interfaz web de un cajero automático (ATM) para la empresa ficticia Pokémon Bank. Fase 1: Front-End con HTML5, CSS3 y Bootstrap 5.3.

## Capturas

[Placeholder: Aquí irá una captura de pantalla de la pantalla de login]

[Placeholder: Aquí irá una captura de pantalla de la pantalla de acciones]

## Tecnologías usadas

- HTML5 semántico
- CSS3 con variables CSS
- Bootstrap 5.3 (CDN)
- Bootstrap Icons (CDN)
- Git + GitHub

## Estructura de carpetas

```
pokemon-bank/
├── index.html              # Pantalla de Login (PIN)
├── acciones.html           # Pantalla principal de transacciones
├── historial.html          # Historial de transacciones
├── grafico.html            # Pantalla con placeholder de gráfico
├── css/
│   └── styles.css          # Estilos personalizados
├── js/
│   └── .gitkeep            # Carpeta reservada para fase 2
├── images/
│   ├── logo.png            # Logo Pokémon Bank
│   └── trainer-avatar.png  # Avatar del usuario
└── README.md
```

## Cómo visualizar

Abrir `index.html` directamente en un navegador web.

```bash
# Ejemplo en macOS
open index.html

# Ejemplo en Linux
xdg-open index.html

# Ejemplo en Windows
start index.html
```

## Flujo de navegación

```
index.html (Login)
    │
    └──> acciones.html (Pantalla principal)
              ├──> historial.html (Historial de transacciones)
              ├──> grafico.html (Análisis de transacciones)
              ├──> [Modal] Depositar
              ├──> [Modal] Retirar
              ├──> [Modal] Consultar saldo
              └──> [Modal] Pagar servicios
```

## Usuario de prueba

- **Nombre:** Ash Ketchum
- **Número de cuenta:** 151-0025-0001
- **PIN:** 2580
- **Saldo:** $1,250.75